const https = require("https");

function addLeadingZero(num) {
  num = num.toString();
  while (num.length < 2) num = "0" + num;
  return num;
}

function buildRFC822Date(dateString) {
  const dayStrings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthStrings = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const timeStamp = Date.parse(dateString);
  const date = new Date(timeStamp);

  const day = dayStrings[date.getDay()];
  const dayNumber = addLeadingZero(date.getDate());
  const month = monthStrings[date.getMonth()];
  const year = date.getFullYear();
  const time = `${addLeadingZero(date.getHours())}:${addLeadingZero(date.getMinutes())}:00`;
  const timezone = date.getTimezoneOffset() === 0 ? "GMT" : "BST";

  //Wed, 02 Oct 2002 13:00:00 GMT
  return `${day}, ${dayNumber} ${month} ${year} ${time} ${timezone}`;
}

async function getPosts() {
  return new Promise((resolve, reject) => {
    const query = `
    query {
      blogPostCollection {
        items {
          sys {
            firstPublishedAt
            id
          }
          title
          type
          slug
          categories
          featureImage {
          	fileName
            url
          }
          date
          excerpt
          metaDescription
          backgroundImage {
            fileName
            url
          }
          author {
            name
          }
          featurePostExcerpt
        }
      }
    }
    `;

    const options = {
      protocol: "https:",
      hostname: "graphql.contentful.com",
      path: "/content/v1/spaces/tapz5cpfdvpb",
      method: "POST",
      headers: {
        Authorization: "Bearer q--vfEYGfj4hB4NrQm8e0BCQ4FcuSeVFn1I5TpbAmiM",
        "Content-Type": "application/json",
      },
    };

    let posts = "";

    const req = https.request(options, (res) => {
      res.on("data", (data) => {
        posts += data;
      });

      res.on("end", () => {
        const parsedPosts = JSON.parse(posts);
        console.log("Parsed Posts: " + parsedPosts);
        resolve(parsedPosts.data.blogPostCollection.items);
      });
    });

    req.on("error", (e) => {
      console.error(e);
    });

    req.write(JSON.stringify({ query }));
    req.end();
  });
}

function buildRssItems(items) {
  const truncateLength = 44;

  return items
    .map((item) => {
      const hasTitle = item.title;
      const updatedTitle = hasTitle.replace("&"," and ");

      const hasLink = item.slug;
      const hasDescription = item.metaDescription;
      const hasAuthor = item.author.name;

      const title = hasTitle ? updatedTitle : "New Post"   
      const link = hasLink ? ` https://bluecape.com/blog/${item.slug}` : "";
      const description = hasDescription ? `${item.metaDescription} - ${link}` : "";
      const author = hasAuthor ? `${item.author.name}` : "Bluescape Team"

      return `
        <item>
        <title>${title}</title>
        <description>${description}</description>
        <author>${author}</author>
        <link>${link}</link>
        <guid>${item.sys.id}</guid>
        <pubDate>${buildRFC822Date(item.sys.firstPublishedAt)}</pubDate>
        </item>
        `;
    })
    .join("");
}

exports.handler = async function (event, context) {
  const rssFeed = `<?xml version="1.0"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bluescape Blog | Remote Visual Collaboration  | Bluescape</title>
    <atom:link href="bluescape-rss.netlify.app/.netlify/functions/rss" rel="self" type="application/rss+xml" />
    <link>https://bluescape.com/blog</link>
    <description>Learn about visual collaboration solutions and best practices for hybrid and remote teams in the Bluescape blog.</description>
    ${buildRssItems(await getPosts())}
  </channel>
  </rss>`;

  return {
    statusCode: 200,
    contentType: "text/xml",
    body: rssFeed,
  };
};