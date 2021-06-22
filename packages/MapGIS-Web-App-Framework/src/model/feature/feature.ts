import { Bound } from '../objects/geometry'

/**
 * IGS查询结果XY结构
 */
export interface XY {
  x?: number
  y?: number
}

/**
 * IGS查询结果Arc结构
 */
export interface Arc {
  Dots?: XY[]
  ArcID?: number
}

/**
 * IGS查询结果Ring结构
 */
export interface Ring {
  Arcs?: Arc[]
}

/**
 * IGS查询结果PntGeom结构
 */
export interface PntGeom {
  Dot?: XY
  GID?: number
}

/**
 * IGS查询结果LinGeom结构
 */
export interface LinGeom {
  Line?: Ring
  GID?: number
}

/**
 * IGS查询结果RegGeom结构
 */
export interface RegGeom {
  Rings?: Ring[]
  GID?: number
}

/**
 * IGS查询结果FGeom结构
 */
export interface FGeom {
  PntGeom?: PntGeom[]
  LinGeom?: LinGeom[]
  RegGeom?: RegGeom[]
  SurfaceGeom?: unknown
  EntityGeom?: unknown
  StreamGeom?: unknown
  G3DPntGeom?: unknown
  G3DLinGeom?: unknown
  G3DRegGeom?: unknown
}

/**
 * IGS查询结果SFEleArray结构
 */
export interface FeatureIGSSFEle {
  FID: number
  ftype: number
  bound?: Bound
  AttValue?: any[]
  fGeom: FGeom
  GraphicInfo?: unknown
}

/**
 * IGS查询结果AttStruct结构
 */
export interface FeatureIGSAttStruct {
  FldNumber?: number
  FldName?: any[]
  FldType?: any[]
  FldAlias?: any[]
}

/**
 * IGS查询结果的结构
 */
export interface FeatureIGS {
  AttStruct: FeatureIGSAttStruct
  SFEleArray: FeatureIGSSFEle[]
  LabelDots?: unknown[]
  TotalCount: number
}
