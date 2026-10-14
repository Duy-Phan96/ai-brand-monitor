import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import {
  AppBar,
  Box,
  Chip,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

export function App() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <InsightsRoundedIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            AI Brand Monitor
          </Typography>
          <Chip label="MVP foundation" size="small" variant="outlined" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={2} maxWidth={720}>
          <Typography variant="overline" color="primary">
            Brand intelligence workspace
          </Typography>
          <Typography variant="h3" component="h2" fontWeight={700}>
            Turn online mentions into clear next actions.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The application foundation is ready. Dashboard metrics, mention
            workflows and transparent analysis will be implemented in the next
            milestones.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
