import { Box, Tooltip, useMediaQuery } from "@mui/material";
import { useState, type PropsWithChildren } from "react";

type NSTooltipProps = {
    title: string;
};

export const NSTooltip = ({ title, children }: PropsWithChildren<NSTooltipProps>) => {
    const [isOpen, setIsOpen] = useState(false);

    const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            setIsOpen(false);
        }
    };
    return (
        <Tooltip title={title} open={isOpen} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Box>
                {children}
            </Box>
        </Tooltip>
    );
};