import type { Photo } from "@/entities/photo";
import type { TaskStatus } from "@/entities/task";

export type TaskContextType = {
    status: TaskStatus;

    reportFiles: File[];
    reportImages: Photo[];
    setReportFiles: (files: File[]) => void;
    setReportImages: (images: Photo[]) => void;
};
