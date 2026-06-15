import type { Theme } from "@emotion/react";
import type { SxProps } from "@mui/material";

export type PageLayoutProps = {
    title?: string;
    withPadding?: boolean;
    isScreenHeight?: boolean;
    sx?: SxProps<Theme>;
};

