module Hasura.RQL.Types.RemoteSchema where

import           Hasura.Prelude
import           Hasura.RQL.Types.Common       (NonEmptyText)
import           Language.Haskell.TH.Syntax    (Lift)
import           System.Environment            (lookupEnv)

import qualified Data.Aeson                    as J
import qualified Data.Aeson.Casing             as J
import qualified Data.Aeson.TH                 as J
import qualified Data.Text                     as T
import qualified Database.PG.Query             as Q
import qualified Language.GraphQL.Draft.Syntax as G
import qualified Network.URI.Extended          as N

import           Hasura.RQL.DDL.Headers        (HeaderConf (..))
import           Hasura.RQL.Types.Error
import           Hasura.RQL.Types.Permission
import           Hasura.SQL.Types              (DQuote)

type UrlFromEnv = Text

newtype RemoteSchemaName
  = RemoteSchemaName
  { unRemoteSchemaName :: NonEmptyText }
  deriving ( Show, Eq, Lift, Hashable, J.ToJSON, J.ToJSONKey
           , J.FromJSON, Q.ToPrepArg, Q.FromCol, DQuote
           )

data RemoteSchemaInfo
  = RemoteSchemaInfo
  { rsUrl              :: !N.URI
  , rsHeaders          :: ![HeaderConf]
  , rsFwdClientHeaders :: !Bool
  , rsTimeoutSeconds   :: !Int
  } deriving (Show, Eq, Lift, Generic)

instance Hashable RemoteSchemaInfo

$(J.deriveJSON (J.aesonDrop 2 J.snakeCase) ''RemoteSchemaInfo)

data RemoteSchemaDef
  = RemoteSchemaDef
  { _rsdUrl                  :: !(Maybe N.URI)
  , _rsdUrlFromEnv           :: !(Maybe UrlFromEnv)
  , _rsdHeaders              :: !(Maybe [HeaderConf])
  , _rsdForwardClientHeaders :: !Bool
  , _rsdTimeoutSeconds       :: !(Maybe Int)
  } deriving (Show, Eq, Lift)

$(J.deriveJSON (J.aesonDrop 4 J.snakeCase) ''RemoteSchemaDef)

data AddRemoteSchemaQuery
  = AddRemoteSchemaQuery
  { _arsqName       :: !RemoteSchemaName -- TODO: name validation: cannot be empty?
  , _arsqDefinition :: !RemoteSchemaDef
  , _arsqComment    :: !(Maybe Text)
  } deriving (Show, Eq, Lift)

$(J.deriveJSON (J.aesonDrop 5 J.snakeCase) ''AddRemoteSchemaQuery)

newtype RemoteSchemaNameQuery
  = RemoteSchemaNameQuery
  { _rsnqName    :: RemoteSchemaName
  } deriving (Show, Eq, Lift)

$(J.deriveJSON (J.aesonDrop 5 J.snakeCase) ''RemoteSchemaNameQuery)

data RemoteTypePerm
  = RemoteTypePerm
  { rtpType   :: G.NamedType
  , rtpFields :: [G.Name]
  } deriving (Show, Eq, Lift)

$(J.deriveJSON (J.aesonDrop 3 J.snakeCase) ''RemoteTypePerm)

data RemoteSchemaPermissions
  = RemoteSchemaPermissions
  { rsPermRemoteSchema :: RemoteSchemaName
  , rsPermRole         :: RoleName
  , rsPermDefinition   :: [RemoteTypePerm]
  } deriving (Show, Eq, Lift)

$(J.deriveJSON (J.aesonDrop 6 J.snakeCase) ''RemoteSchemaPermissions)

getUrlFromEnv :: (MonadIO m, MonadError QErr m) => Text -> m N.URI
getUrlFromEnv urlFromEnv = do
  mEnv <- liftIO . lookupEnv $ T.unpack urlFromEnv
  env  <- maybe (throw400 InvalidParams $ envNotFoundMsg urlFromEnv) return
          mEnv
  maybe (throw400 InvalidParams $ invalidUri env) return $ N.parseURI env
  where
    invalidUri uri = "not a valid URI: " <> T.pack uri
    envNotFoundMsg e =
      "environment variable '" <> e <> "' not set"

validateRemoteSchemaDef
  :: (MonadError QErr m, MonadIO m)
  => RemoteSchemaDef
  -> m RemoteSchemaInfo
validateRemoteSchemaDef (RemoteSchemaDef mUrl mUrlEnv hdrC fwdHdrs mTimeout) =
  case (mUrl, mUrlEnv) of
    (Just url, Nothing)    ->
      return $ RemoteSchemaInfo url hdrs fwdHdrs timeout
    (Nothing, Just urlEnv) -> do
      url <- getUrlFromEnv urlEnv
      return $ RemoteSchemaInfo url hdrs fwdHdrs timeout
    (Nothing, Nothing)     ->
        throw400 InvalidParams "both `url` and `url_from_env` can't be empty"
    (Just _, Just _)       ->
        throw400 InvalidParams "both `url` and `url_from_env` can't be present"
  where
    hdrs = fromMaybe [] hdrC

    timeout = fromMaybe 60 mTimeout

data DropRemoteSchemaPermissions
  = DropRemoteSchemaPermissions
  { drsPermRemoteSchema :: RemoteSchemaName
  , drsPermRole         :: RoleName
  } deriving (Show, Eq, Lift)

$(J.deriveJSON (J.aesonDrop 7 J.snakeCase) ''DropRemoteSchemaPermissions)
