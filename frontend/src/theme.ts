import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#155e58", light: "#dceee7", dark: "#103e3a" },
    secondary: { main: "#485b77" },
    background: { default: "#f5f7f6", paper: "#ffffff" },
    text: { primary: "#182c2a", secondary: "#536663" },
    divider: "#dbe4e0",
    success: { main: "#276743" },
    error: { main: "#a9343c" },
    warning: { main: "#845200" },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
    h1: { fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.04em" },
    h2: { fontSize: "1.65rem", fontWeight: 700, letterSpacing: "-0.03em" },
    h3: { fontSize: "1.05rem", fontWeight: 650 },
    button: { textTransform: "none", fontWeight: 600 },
    overline: { fontSize: "0.68rem", letterSpacing: "0.12em", fontWeight: 700 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 24, paddingInline: 18 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { border: "1px solid #dbe4e0", boxShadow: "none" },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: { padding: 24, "&:last-child": { paddingBottom: 24 } },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
        slotProps: { transition: { timeout: 0 } },
      },
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: "1px solid #dbe4e0",
          "&:before": { display: "none" },
          "&:first-of-type, &:last-of-type": { borderRadius: 16 },
        },
      },
    },
    MuiAccordionSummary: { styleOverrides: { root: { minHeight: 56 } } },
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollPaddingTop: 24 },
        "*:focus-visible": { outline: "3px solid #155e58", outlineOffset: 3 },
        a: { color: "#155e58" },
      },
    },
  },
});
