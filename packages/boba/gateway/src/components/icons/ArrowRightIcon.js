import * as React from "react";
import { useTheme } from "@mui/material/styles";

function ArrowRightIcon() {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';
    const color = theme.palette.common[isLight ? 'black' : 'white'];
    return (
        <svg width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M24 16L24.5606 16.4983L25.0035 16L24.5606 15.5017L24 16ZM19.4394 20.0017C19.1643 20.3113 19.1921 20.7854 19.5017 21.0606C19.8113 21.3357 20.2854 21.3079 20.5606 20.9983L19.4394 20.0017ZM20.5606 11.0017C20.2854 10.6921 19.8113 10.6643 19.5017 10.9394C19.1921 11.2146 19.1643 11.6887 19.4394 11.9983L20.5606 11.0017ZM8 16.75H24V15.25H8V16.75ZM23.4394 15.5017L19.4394 20.0017L20.5606 20.9983L24.5606 16.4983L23.4394 15.5017ZM24.5606 15.5017L20.5606 11.0017L19.4394 11.9983L23.4394 16.4983L24.5606 15.5017Z"
                fill={color}
            />
        </svg>
    );
}

export default ArrowRightIcon;
