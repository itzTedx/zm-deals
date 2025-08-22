import { PERMISSIONS } from "./constants";

export type Resource = keyof typeof PERMISSIONS;
export type ActionFor<R extends Resource> = (typeof PERMISSIONS)[R][number];
export type PermissionMap = {
  [R in Resource]?: ActionFor<R>[];
};

export interface HasPermissionOptions {
  redirectTo?: string;
  throwOnFail?: boolean;
}
