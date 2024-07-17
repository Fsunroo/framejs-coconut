import { createFrames, Button } from "frames.js/cloudflare-workers";
import type { JsonValue } from "frames.js/types";
import axios from 'axios';

type Env = {
  /**
   * Taken from wrangler.toml#vars
   */
  MY_APP_LABEL: string;
};

const frames = createFrames<JsonValue | undefined, Env>({
  imagesRoute: "/",  // Set the imagesRoute option to the initial frame route
});

const fetch = frames(async (ctx) => {
  const { status, message, request, data } = ctx;

  // Get the URL from the request object
  const url = new URL(request.url);
  const inputText = url.searchParams.get('inputText') || message?.inputText;

  let fidnum = 0;
  let fname = "?";
  let tippedToday = "0";
  let remainingAllocation = "0";
  let todayAllocation = "0";
  let totaltip = "0";
  let tipPercent = "0";
  let time = "0";
  let avatarUrl = "https://i.postimg.cc/4Nj7s5fV/image-7.png";

  if (status !== 'initial') {
    let userFid = inputText || data?.fid;
    fidnum = Number(userFid);
    try {
      const response = await axios.get(`http://api.bananabonanza.lol/frame/tipcheck?fid=${userFid}`);
      let rawdata = response.data;
      fname = rawdata.fname || fname;
      tipPercent = rawdata.tipPercent;
      remainingAllocation = rawdata.remainingAllocation || remainingAllocation;
      todayAllocation = rawdata.todaysAllocation || todayAllocation;
      totaltip = rawdata.totalTip || totaltip;
      avatarUrl = rawdata.avatar_url || avatarUrl;
      tippedToday = rawdata.tippedToday || tippedToday;
      time = rawdata.time || time;
      tipPercent = tippedToday / todayAllocation;
      if (tipPercent > 1) {
        tipPercent = 1;
      }
      tipPercent = (tipPercent * 100).toFixed(2);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return {
    image: (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: "#01204E", color: "black" }}>
        <img style={{ position: "absolute", bottom: 0, right: 0, width: "100%", height: "100%" }} src='https://i.postimg.cc/g0jg8SKm/background.png' />
        <div style={{ display: "flex", alignItems: "center", position: "absolute", top: "8px", paddingTop: "1px" }}>
          <img style={{ width: "90px", height: "90px" }} src='https://i.postimg.cc/KjqTNLtQ/coconutleft.png' />
          <h1 style={{ fontWeight: "bold", fontSize: "46px" }}>Coconut Stats</h1>
          <img style={{ width: "90px", height: "90px" }} src='https://i.postimg.cc/mgF9YPkN/coconutright.png' />
        </div>

        {status !== 'initial' && (
          <div style={{ display: "flex", flexDirection: "column", paddingLeft: "4px", paddingRight: "4px", paddingBottom: "36px", paddingTop: "24px" }}>
            <div style={{ display: "flex", paddingTop: "24px" }}>
              <img src={avatarUrl} style={{ width: "90px", height: "90px", border: "5px solid white", marginTop: "2px" }} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "4px" }}>
                <div style={{ fontSize: "36px" }}>Name: {fname}</div>
                <div style={{ fontSize: "24px" }}>FID: {fidnum}</div>
              </div>
              <img src='https://i.postimg.cc/nzTndvcX/coconut.png' style={{ width: "140px", height: "140px", position: "absolute", right: 0, top: "18px", marginTop: "2px" }} />
            </div>
            <div style={{ display: "flex", paddingTop: "4px" }}>
              <div style={{ paddingRight: "4px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "24px" }}>Today's Allocation</div>
                <div style={{ fontSize: "46px", paddingBottom: "4px" }}>{todayAllocation}</div>
                <div style={{ fontSize: "24px" }}>Total Tipped</div>
                <div style={{ fontSize: "46px" }}>{tippedToday}</div>
              </div>
              <div style={{ paddingLeft: "4px", paddingRight: "4px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "24px" }}>Remaining Allocation</div>
                <div style={{ fontSize: "46px", paddingBottom: "4px" }}>{remainingAllocation}</div>
                <div style={{ fontSize: "26px" }}>Total Earned</div>
                <div style={{ fontSize: "46px" }}>{totaltip}</div>
              </div>
              <div style={{ paddingLeft: "4px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "30px" }}>Tipped %</div>
                <div style={{ fontSize: "46px" }}>{tipPercent}%</div>
              </div>
            </div>
            <div style={{ fontSize: "24px", width: "100%", textAlign: "center", justifyContent: "center", paddingLeft: "56px", paddingTop: "7px" }}>{time}</div>
          </div>
        )}

        {status === 'initial' && (
          <div style={{ display: "flex", flexDirection: "column", paddingBottom: "20px" }}>
            <p style={{ fontWeight: "bold", fontSize: "40px", textAlign: "center" }}>Write Your FID To Check Your Status</p>
          </div>
        )}
      </div>
    ),
    buttons: status === 'initial'
      ? [
          <Button action="post" target={{ query: { inputText: '' } }}>Check</Button>,
          <input type="text" name="inputText" placeholder="Enter Fid Here" />
        ]
      : [
          <Button action="post" target={{ query: { inputText } }}>Check</Button>,
          <Button action="post" target="/">Reset</Button>
        ],
  };
});

export default {
  fetch,
} satisfies ExportedHandler<Env>;
