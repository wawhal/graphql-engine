module Hasura.RQL.DDL.Schema.Function where

import           Hasura.GraphQL.Utils          (isValidName, showNames)
import           Hasura.Prelude
import           Hasura.RQL.Types
import           Hasura.SQL.Types

import           Data.Aeson
import           Data.Aeson.Casing
import           Data.Aeson.TH
import           Language.Haskell.TH.Syntax    (Lift)

import qualified Hasura.GraphQL.Schema         as GS
import qualified Language.GraphQL.Draft.Syntax as G

import qualified Data.HashMap.Strict           as M
import qualified Data.Sequence                 as Seq
import qualified Data.Text                     as T
import qualified Database.PG.Query             as Q


data PGTypType
  = PTBASE
  | PTCOMPOSITE
  | PTDOMAIN
  | PTENUM
  | PTRANGE
  | PTPSUEDO
  deriving (Show, Eq)
$(deriveJSON defaultOptions{constructorTagModifier = drop 2} ''PGTypType)

data RawFuncInfo
  = RawFuncInfo
  { rfiHasVariadic      :: !Bool
  , rfiFunctionType     :: !FunctionType
  , rfiReturnTypeSchema :: !SchemaName
  , rfiReturnTypeName   :: !T.Text
  , rfiReturnTypeType   :: !PGTypType
  , rfiReturnsSet       :: !Bool
  , rfiInputArgTypes    :: ![PGColType]
  , rfiInputArgNames    :: ![T.Text]
  , rfiReturnsTable     :: !Bool
  } deriving (Show, Eq)
$(deriveFromJSON (aesonDrop 3 snakeCase) ''RawFuncInfo)

mkFunctionArgs :: [PGColType] -> [T.Text] -> [FunctionArg]
mkFunctionArgs tys argNames =
  bool withNames withNoNames $ null argNames
  where
    withNoNames = flip map tys $ \ty -> FunctionArg Nothing ty
    withNames = zipWith mkArg argNames tys

    mkArg "" ty = FunctionArg Nothing ty
    mkArg n  ty = flip FunctionArg ty $ Just $ FunctionArgName n

validateFuncArgs :: MonadError QErr m => [FunctionArg] -> m ()
validateFuncArgs args =
  unless (null invalidArgs) $ throw400 NotSupported $
    "arguments: " <> showNames invalidArgs
    <> " are not in compliance with GraphQL spec"
  where
    funcArgsText = mapMaybe (fmap getFuncArgNameTxt . faName) args
    invalidArgs = filter (not . isValidName) $ map G.Name funcArgsText

mkFunctionInfo :: QualifiedFunction -> RawFuncInfo -> Q.TxE QErr FunctionInfo
mkFunctionInfo qf rawFuncInfo = do
  -- throw error if function has variadic arguments
  when hasVariadic $ throw400 NotSupported "function with \"VARIADIC\" parameters are not supported"
  -- throw error if return type is not composite type
  when (retTyTyp /= PTCOMPOSITE) $ throw400 NotSupported "function does not return a \"COMPOSITE\" type"
  -- throw error if function do not returns SETOF
  unless retSet $ throw400 NotSupported "function does not return a SETOF"
  -- throw error if return type is not a valid table
  unless returnsTab $ throw400 NotSupported "function does not return a SETOF table"
  -- throw error if function type is VOLATILE
  when (funTy == FTVOLATILE) $ throw400 NotSupported "function of type \"VOLATILE\" is not supported now"

  let funcArgs = mkFunctionArgs inpArgTyps inpArgNames
  validateFuncArgs funcArgs

  let funcArgsSeq = Seq.fromList funcArgs
      dep = SchemaDependency (SOTable retTable) "table"
      retTable = QualifiedObject retSn (TableName retN)
  return $ FunctionInfo qf False funTy funcArgsSeq retTable [dep]
  where
    RawFuncInfo hasVariadic funTy retSn retN retTyTyp
                retSet inpArgTyps inpArgNames returnsTab
                = rawFuncInfo

-- Build function info
getFunctionInfo :: QualifiedFunction -> Q.TxE QErr FunctionInfo
getFunctionInfo qf@(QualifiedObject sn fn) = do
  -- fetch function details
  funcData <- Q.catchE defaultTxErrorHandler $
              Q.listQ $(Q.sqlFromFile "src-rsr/function_info.sql") (sn, fn) True

  case funcData of
    []                              ->
      throw400 NotExists $ "no such function exists in postgres : " <>> qf
    [Identity (Q.AltJ rawFuncInfo)] -> mkFunctionInfo qf rawFuncInfo
    _                               ->
      throw400 NotSupported $
      "function " <> qf <<> " is overloaded. Overloaded functions are not supported"

saveFunctionToCatalog :: QualifiedFunction -> Bool -> Q.TxE QErr ()
saveFunctionToCatalog (QualifiedObject sn fn) isSystemDefined =
  Q.unitQE defaultTxErrorHandler [Q.sql|
         INSERT INTO "hdb_catalog"."hdb_function" VALUES ($1, $2, $3)
                 |] (sn, fn, isSystemDefined) False

delFunctionFromCatalog :: QualifiedFunction -> Q.TxE QErr ()
delFunctionFromCatalog (QualifiedObject sn fn) =
  Q.unitQE defaultTxErrorHandler [Q.sql|
         DELETE FROM hdb_catalog.hdb_function
         WHERE function_schema = $1
           AND function_name = $2
         |] (sn, fn) False

newtype TrackFunction
  = TrackFunction
  { tfName :: QualifiedFunction}
  deriving (Show, Eq, FromJSON, ToJSON, Lift)

trackFunctionP1
  :: (CacheRM m, UserInfoM m, QErrM m) => TrackFunction -> m ()
trackFunctionP1 (TrackFunction qf) = do
  adminOnly
  rawSchemaCache <- askSchemaCache
  when (M.member qf $ scFunctions rawSchemaCache) $
    throw400 AlreadyTracked $ "function already tracked : " <>> qf

trackFunctionP2Setup :: (QErrM m, CacheRWM m, MonadTx m)
                     => QualifiedFunction -> m ()
trackFunctionP2Setup qf = do
  fi <- withPathK "name" $ liftTx $ getFunctionInfo qf
  let retTable = fiReturnType fi
      err = err400 NotExists $ "table " <> retTable <<> " is not tracked"
  sc <- askSchemaCache
  void $ liftMaybe err $ M.lookup retTable $ scTables sc
  addFunctionToCache fi

trackFunctionP2 :: (QErrM m, CacheRWM m, MonadTx m)
                => QualifiedFunction -> m RespBody
trackFunctionP2 qf = do
  sc <- askSchemaCache
  let defGCtx = scDefaultRemoteGCtx sc
      funcNameGQL = GS.qualObjectToName qf
  -- check function name is in compliance with GraphQL spec
  unless (isValidName funcNameGQL) $ throw400 NotSupported $
    "function name " <> qf <<> " is not in compliance with GraphQL spec"
  -- check for conflicts in remote schema
  GS.checkConflictingNode defGCtx funcNameGQL
  trackFunctionP2Setup qf
  liftTx $ saveFunctionToCatalog qf False
  return successMsg

runTrackFunc
  :: ( QErrM m, CacheRWM m, MonadTx m
     , UserInfoM m
     )
  => TrackFunction -> m RespBody
runTrackFunc q = do
  trackFunctionP1 q
  trackFunctionP2 $ tfName q

newtype UnTrackFunction
  = UnTrackFunction
  { utfName :: QualifiedFunction }
  deriving (Show, Eq, FromJSON, ToJSON, Lift)

runUntrackFunc
  :: ( QErrM m, CacheRWM m, MonadTx m
     , UserInfoM m
     )
  => UnTrackFunction -> m RespBody
runUntrackFunc (UnTrackFunction qf) = do
  adminOnly
  void $ askFunctionInfo qf
  liftTx $ delFunctionFromCatalog qf
  delFunctionFromCache qf
  return successMsg
