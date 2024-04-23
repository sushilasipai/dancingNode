const app = require("express");
const axios = require("axios");
const express = app();
const cors = require("cors");

const bodyParser = require("body-parser");

express.use(bodyParser.json({ limit: "50MB" }));
express.use(cors());

express.post("/cluster", async (req, res) => {
  const { documents, method } = req.body;
  const clusterURL = "http://127.0.0.1:3001/cluster";
  const origin = "http://localhost:3000"; // Update with your client origin

  console.log(req.body);
  try {
    const data = await axios.post(
      clusterURL,
      { documents, method },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res.status(200).json({ data: data.data.result });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

express.post("/query_expansion", async (req, res) => {
  const { query, solr_results, clustertype } = req.body;
  const clusterURL = "http://127.0.0.1:3001/query_expansion";
  const origin = "http://localhost:3000"; // Update with your client origin

  try {
    const data = await axios.post(
      clusterURL,
      { query, solrResults: solr_results, clustertype },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("data from expansion", data);
    return res.status(200).json({ data: data.data.expanded_query });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

express.post("/", async (req, res) => {
  const { query, algo, page, expanded_query } = req.body;
  let queryPayload;
  const pageSize = 30;
  const start = (page - 1) * pageSize;

  if (algo === "pagerank") {
    queryPayload = {
      query: expanded_query
        ? `(title:${query} OR content:${query})`
        : `(title:"${query}" OR content:"${query}")`,
      sort: `score desc`,

      params: {
        rows: pageSize,
        start: start, // Start offset
      },
    };
  } else {
    queryPayload = {
      query: expanded_query
        ? `(title:${query} OR content:${query})`
        : `(title:"${query}" OR content:"${query}")`,
      sort: `authority desc, hub desc`,
      params: {
        rows: pageSize,
        start: start, // Start offset
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
