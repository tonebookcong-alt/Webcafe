// src/components/feedback/SiteFeedbackSection.tsx

import * as React from "react";
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, CircularProgress } from "@mui/material";
import FeedbackForm from "./FeedbackForm";

type Feedback = { id: string, user_id: string, content: string, created_at: string };
const backend = import.meta.env.VITE_BACKEND_URL;

export default function SiteFeedbackSection() {
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchFeedback = React.useCallback(() => {
    fetch(`${backend}/feedback`).then(res => res.json()).then(setFeedbacks).finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Bình luận</Typography>
      <FeedbackForm onPostSuccess={() => setTimeout(fetchFeedback, 2000)} />
      <Divider sx={{ my: 3 }} />
      {loading ? <CircularProgress /> :
        <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
          {feedbacks.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar><Avatar /></ListItemAvatar>
                <ListItemText primary={item.content} secondary={`— Khách hàng, ${new Date(item.created_at).toLocaleDateString('vi-VN')}`} />
              </ListItem>
              {index < feedbacks.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      }
    </Box>
  );
}