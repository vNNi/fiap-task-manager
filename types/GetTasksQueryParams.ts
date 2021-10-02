import { TaskStatusEnum } from "./TaskStatusEnum";

export type GetTasksQueryParams = {
  finishPrevisionStart?: string;
  finishPrevisionEnd?: string;
  status?: string,
};
