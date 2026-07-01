import type { Theme } from "@emotion/react";
import type { SxProps } from "@mui/material";

export type PageLayoutProps = {
    title?: string;
    sx?: SxProps<Theme>;
    withFooter?: boolean;
    isScreenHeight?: boolean;
};

