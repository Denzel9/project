export type PhotoUploadParams = {
    data: FormData,
    folder: string,
    id: string
}

export type PhotoUploadResponse = { key: string; url: string, name: string }

export type Photo = {
    filename: string
    key: string
    lastModified: string
    size: number
    url: string
}

export type GetPhotoUploadResponse = {
    files: Photo[]
}

export type GetPhotoUploadParams = { id: string, folder: string }

export type GetMultipleFilesResponse = {
    files: Photo[]
}[]

export type GetMultipleFilesParams = { ids: string[]; folder: string }

