import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#8A5A3C" },     // nâu cà phê
    secondary: { main: "#F1B980" },   // kem nhạt
    background: { default: "#FAF7F2", paper: "#FFFFFF" },
    text: { primary: "#1F1B16", secondary: "#5E5A56" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: { backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,.75)" }
      }
    },
    MuiCard: {
      defaultProps: { elevation: 2 }
    },
  },
  typography: {
    fontFamily: [
      "Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto",
      "Helvetica Neue", "Arial", "Noto Sans", "sans-serif"
    ].join(","),
    h3: { fontWeight: 800 },
  },
});

export default theme;
