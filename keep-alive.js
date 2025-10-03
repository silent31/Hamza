const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Remade Aminul Sardar !!');
});

app.listen(port, () => {
  console.log(`Your app is listening at http://localhost:${port}`);
});
