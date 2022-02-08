import * as React from "react";
import { useTheme } from "@mui/material/styles";

function HideIcon() {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';
    const color = theme.palette.common[isLight ? 'black' : 'white'];
    return (
        <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M11 11L16 16L11 21"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round" />
            <path d="M16 11L21 16L16 21"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round" />
        </svg>
    );
}

export default HideIcon;
