import type { Photo } from "@/entities/photo";
import type { TaskStatus } from "@/entities/task";
import type { LocalMediaFile } from "@/shared/lib/media";

export type TaskContextType = {
    status: TaskStatus;

    reportFiles: LocalMediaFile[];
    reportImages: Photo[];
    setReportFiles: (files: LocalMediaFile[]) => void;
    setReportImages: (images: Photo[]) => void;
};
