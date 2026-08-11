import type { Theme } from "@emotion/react";
import type { SxProps } from "@mui/material";

export type PageLayoutProps = {
    sx?: SxProps<Theme>;
    withHeader?: boolean;
    withFooter?: boolean;
    isScreenHeight?: boolean;
    printHide?: boolean;
};

