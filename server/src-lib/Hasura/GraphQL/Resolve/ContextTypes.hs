module Hasura.GraphQL.Resolve.ContextTypes where

import           Hasura.Prelude

import qualified Data.HashMap.Strict           as Map
import qualified Data.Sequence                 as Seq
import qualified Language.GraphQL.Draft.Syntax as G

import           Hasura.RQL.Types.BoolExp
import           Hasura.RQL.Types.Common
import           Hasura.SQL.Types


data RelFld
  = RelFld
  { _rfInfo       :: !RelInfo
  , _rfIsAgg      :: !Bool
  , _rfCols       :: !PGColGNameMap
  , _rfPermFilter :: !AnnBoolExpPartialSQL
  , _rfPermLimit  :: !(Maybe Int)
  } deriving (Show, Eq)

type FieldMap
  = Map.HashMap (G.NamedType, G.Name)
    (Either PGColInfo RelFld)

-- order by context
data OrdByItem
  = OBIPGCol !PGColInfo
  | OBIRel !RelInfo !AnnBoolExpPartialSQL
  | OBIAgg !RelInfo !PGColGNameMap !AnnBoolExpPartialSQL
  deriving (Show, Eq)

type OrdByItemMap = Map.HashMap G.Name OrdByItem

type OrdByCtx = Map.HashMap G.NamedType OrdByItemMap

newtype FuncArgItem
  = FuncArgItem {getArgName :: G.Name}
  deriving (Show, Eq)

type FuncArgSeq = Seq.Seq FuncArgItem

-- insert context
type RelationInfoMap = Map.HashMap RelName RelInfo

data UpdPermForIns
  = UpdPermForIns
  { upfiCols   :: ![PGCol]
  , upfiFilter :: !AnnBoolExpPartialSQL
  , upfiSet    :: !PreSetColsPartial
  } deriving (Show, Eq)

-- (custom name | generated name) -> PG column info
-- used in resolvers
type PGColGNameMap = Map.HashMap G.Name PGColInfo

data InsCtx
  = InsCtx
  { icView      :: !QualifiedTable
  , icAllCols   :: !PGColGNameMap
  , icSet       :: !PreSetColsPartial
  , icRelations :: !RelationInfoMap
  , icUpdPerm   :: !(Maybe UpdPermForIns)
  } deriving (Show, Eq)

type InsCtxMap = Map.HashMap QualifiedTable InsCtx

type PGColArgMap = Map.HashMap G.Name PGColInfo
