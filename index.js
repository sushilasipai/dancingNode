const app = require("express");
const axios = require("axios");
const express = app();
const cors = require("cors");

const bodyParser = require("body-parser");

express.use(bodyParser.json());
express.use(cors());

express.post("/", async (req, res) => {
  const { query, algo, page } = req.body;
  let queryPayload;
  const pageSize = 10;
  const start = (page - 1) * pageSize;

  if (algo === "pagerank") {
    queryPayload = {
      query: `(title:${query} OR content:${query})`,
      sort: `${algo} desc, tstamp desc`,

      params: {
        rows: pageSize,
        start: start, // Start offset
      },
    };
  } else {
    queryPayload = {
      query: `(title:${query} OR content:${query})`,
      sort: `authority desc, hub desc,  tstamp desc`,
      params: {
        rows: 10, // Number of rows per page
        start: 0,
      },
    };
  }

  // Define the Solr URL
  const solrUrl = "http://localhost:8983/solr/dancingCollection/select";

  try {
    const { data } = await axios.post(solrUrl, queryPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json({
      data,
    });
  } catch (e) {
    console.log(e.response);
    console.log("There was an error");
  }
  // Send the request using Axios
});

express.listen(3000);
