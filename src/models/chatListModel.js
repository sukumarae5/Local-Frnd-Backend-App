import db from "../config/db.js";

export const getChatList = async (myId) => {

 const [rows] = await db.query(
`
SELECT
  u.user_id,
  u.name,
  u.is_online,
  a.image_url AS avatar,

  lm.content AS last_message,
  lm.sent_at AS last_message_time,

  (
    SELECT COUNT(*)
    FROM messages m2
    LEFT JOIN message_reads mr
      ON mr.message_id = m2.message_id
     AND mr.user_id = ?
    WHERE m2.conversation_id = c.conversation_id
      AND m2.sender_id <> ?
      AND mr.message_id IS NULL
      AND m2.is_deleted = 0
  ) AS unread_count

FROM conversations c

JOIN user u
  ON u.user_id =
    CASE
      WHEN c.user1_id = ? THEN c.user2_id
      ELSE c.user1_id
    END

   LEFT JOIN avatars a
  ON a.avatar_id = u.avatar_id


JOIN friends f
  ON (
       (f.user_id_1 = c.user1_id AND f.user_id_2 = c.user2_id)
    OR (f.user_id_1 = c.user2_id AND f.user_id_2 = c.user1_id)
  )
 AND f.status = 'ACCEPTED'

LEFT JOIN (
    SELECT m1.*
    FROM messages m1
    JOIN (
        SELECT conversation_id, MAX(sent_at) AS max_sent_at
        FROM messages
        WHERE is_deleted = 0
        GROUP BY conversation_id
    ) t
      ON t.conversation_id = m1.conversation_id
     AND t.max_sent_at = m1.sent_at
) lm
  ON lm.conversation_id = c.conversation_id

WHERE
  c.user1_id = ?
  OR c.user2_id = ?

ORDER BY lm.sent_at DESC
`,
[myId, myId, myId, myId, myId]
);


  return rows;
};
