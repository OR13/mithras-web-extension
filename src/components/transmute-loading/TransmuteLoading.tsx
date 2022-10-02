import React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const TransmuteLoading = ({
    message,
    style,
    fullPage,
    textStyle,
}: any) => {
    const loadingStyle = {
        filter: "brightness(20%) sepia(3) saturate(300%) hue-rotate(-150deg)",
        ...style,
        maxHeight: "unset",
    };

    const typographyStyle = {
        marginTop: "16px",
        ...textStyle,
    };

    return (
        <Box
            display="flex"
            justifyContent="center"
            style={{
                width: fullPage ? "100%" : "min-content",
            }}
        >
            <Box
                style={{
                    flexDirection: "column",
                    textAlign: "center",
                    marginTop: fullPage ? "20%" : "0%",
                }}
            >
                <img
                    src={`./transmute-loading-white.gif`}
                    alt="loading"
                    style={loadingStyle}
                />
                <Typography style={typographyStyle}>{message}</Typography>
            </Box>
        </Box>
    );
};

TransmuteLoading.propTypes = {
    fullPage: PropTypes.bool,
    message: PropTypes.any,
};
