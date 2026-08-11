import type { TrainingFileType } from "@/shared/config/training-file";

export interface TrainingFile {
  id: string;
  file_type: TrainingFileType;
  storage_path: string;
  processed: boolean;
  created_at: string;
}
