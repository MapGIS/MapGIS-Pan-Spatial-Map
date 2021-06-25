import baseConfigInstance from '../config/base'
import { Objects } from '@mapgis/web-app-framework'

export class ProjectionTransformationUtil {
  public static projectPoints(
    points: number[][],
    originSrs: string,
    destSrs = baseConfigInstance.config.projectionName,
    ip = baseConfigInstance.config.ip,
    port = baseConfigInstance.config.port,
    serverName = baseConfigInstance.config.serverName,
    gdbName = baseConfigInstance.config.gdbName,
    userName = baseConfigInstance.config.userName,
    password = baseConfigInstance.config.password
  ) {
    return Objects.ProjectionTransformation.projectPoints(
      points,
      originSrs,
      destSrs,
      ip,
      port,
      serverName,
      gdbName,
      userName,
      password
    )
  }
}
