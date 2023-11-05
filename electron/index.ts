/* eslint-disable prettier/prettier */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// Native
import path, { join } from "path";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent } from "electron";
import isDev from "electron-is-dev";

puppeteer.use(StealthPlugin());

const height = 600;
const width = 800;

function createWindow() {
  // Create the browser window.
  const window = new BrowserWindow({
    width,
    height,
    //  change to false to use AppBar
    frame: false,
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  const port = process.env.PORT || 3000;
  const url = isDev
    ? `http://localhost:${port}`
    : join(__dirname, "../src/out/index.html");

  // and load the index.html of the app.
  if (isDev) {
    window?.loadURL(url);
  } else {
    window?.loadFile(url);
  }
  // Open the DevTools.
  // window.webContents.openDevTools();

  // For AppBar
  ipcMain.on("minimize", () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMinimized() ? window.restore() : window.minimize();
    // or alternatively: win.isVisible() ? win.hide() : win.show()
  });
  ipcMain.on("maximize", () => {
    // eslint-disable-next-line no-unused-expressions
    window.isMaximized() ? window.restore() : window.maximize();
  });

  ipcMain.on("close", () => {
    window.close();
  });
}

// async function usePuppet() {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto("https://www.fastpeoplesearch.com");
//   await page.setViewport({ width: 1080, height: 1024 });
//   await page.type(".autocomplete-lastname-defer", "keith");
//   await page.click(".search-form-button-submit");
//   await page.waitForSelector(".link-to-details");
//   const result = await page.evaluate(() => {
//     const cardBlocks = Array.from(document.querySelectorAll(".card-block"));
//     const people = cardBlocks.map((cardBlock) => {
//       // @ts-expect-error
//       // testing the stuff abeg
//       const name = cardBlock.querySelector(".larger").textContent.trim();
//       // @ts-expect-error
//       const address = cardBlock
//         .querySelector("a[title*='living at']")
//         .textContent.trim()
//         .replace("\n", " ");
//       return { name, address };
//     });
//     return people;
//   });

//   // const links = await page.evaluate(() => {
//   //   // eslint-disable-next-line no-shadow
//   //   const links = Array.from(document.querySelectorAll('.link-to-details'));
//   //   links.forEach((link, index) => {
//   //     link.classList.add(`link-${index}`);
//   //   });

//   //   const stuff = links.map((link) => {
//   //     return link.classList;
//   //   });
//   //   return stuff;
//   // });

//   const allEmails = [];

//   for (let i = 0; i < result.length; i++) {
//     // if (i != 0) {
//     //   await page.waitForNavigation();
//     // }
//     await page.waitForSelector(".link-to-details");
//     await page.evaluate(() => {
//       // eslint-disable-next-line no-shadow
//       const links = Array.from(document.querySelectorAll(".link-to-details"));
//       links.forEach((link, index) => {
//         link.classList.add(`link-${index}`);
//       });
//       return links;
//     });
//     await Promise.all([
//       page.click(`.link-${i}`),
//       page.waitForNavigation({ timeout: 60000 }),
//       // Wait for navigation to complete
//     ]);

//     try {
//       const emails = await page.evaluate(() => {
//         const emailDiv = document.querySelector(".detail-box-email");
//         // @ts-expect-error
//         const rowDiv = emailDiv.querySelector(".row");
//         // @ts-expect-error
//         const h3Elements = rowDiv.querySelectorAll("h3");
//         // @ts-expect-error
//         const texts = [...h3Elements].map((h3) => h3.textContent.trim());
//         return texts;
//       });

//       const fullName = await page.evaluate(() => {
//         const nameDiv = document.querySelector(".fullname");
//         const texts = nameDiv && nameDiv.textContent?.trim();
//         return texts;
//       });

//       const person = {
//         fullName,
//         emails,
//         address: result[i].address,
//       };

//       allEmails.push(person);
//     } catch (error) {
//       console.log(error);
//     }

//     await page.goBack();
//     // await page.waitForNavigation();
//     await page.waitForSelector(".link-to-details");
//   }

//   try {
//     console.log(allEmails);
//     // Generate a unique filename
//     const timestamp = new Date().getTime();
//     const filename = `emails_${timestamp}.txt`;
//     const filepath = path.resolve(__dirname, filename); // Change '__dirname' to the appropriate directory if needed

//     // Write allEmails to a text file
//     fs.writeFile(filepath, JSON.stringify(allEmails), (err) => {
//       if (err) {
//         console.log("Error writing to file:", err);
//       } else {
//         console.log(`Emails written to file: ${filename}`);
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
//   // const screenshot = await page.screenshot({
//   //   path: "example.png",
//   //   fullPage: true,
//   // });

//   await browser.close();
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

// const wait = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));
async function usePuppet(props: { name: string; city: string }) {
  const { name, city } = props;
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://www.fastpeoplesearch.com");

    await page.setViewport({ width: 1080, height: 1024 });

    await page.type(".autocomplete-lastname-defer", `${name}`);
    await page.type("#search-name-address", `${city}`);
    await page.click(".search-form-button-submit");

    await page.waitForSelector(".link-to-details");

    const result = await page.evaluate(() => {
      const cardBlocks = Array.from(document.querySelectorAll(".card-block"));
      const people = cardBlocks.map((cardBlock) => {
        const name = cardBlock?.querySelector(".larger")?.textContent?.trim();
        const address = cardBlock
          ?.querySelector("a[title*='living at']")
          ?.textContent?.trim()
          .replace("\n", " ");
        return { name, address };
      });
      return people;
    });

    // const links = await page.evaluate((i) => {
    //   const links = Array.from(document.querySelectorAll(".link-to-details"));
    //   links.forEach((link, index) => {
    //     link.classList.add(`link-${index}`);
    //   });

    //   const stuff = links.map((link, index) => {
    //     return link.classList;
    //   });
    //   return stuff;
    // });

    let allEmails = [];

    for (let i = 0; i < result.length; i++) {
      try {
        await page.waitForSelector(".link-to-details", { timeout: 5000 });
        await page.evaluate(() => {
          const links = Array.from(
            document.querySelectorAll(".link-to-details")
          );
          links.forEach((link, index) => {
            link.classList.add(`link-${index}`);
          });
          return links;
        });

        await Promise.all([
          page.click(`.link-${i}`),
          page.waitForNavigation({ timeout: 60000 }),
          // Wait for navigation to complete
        ]);

        await page.waitForSelector("text/Email Addresses", { timeout: 5000 });
        const emails = await page.evaluate(() => {
          const emailDiv = document?.querySelector(".detail-box-email");
          const rowDiv = emailDiv?.querySelector(".row");
          const h3Elements = rowDiv?.querySelectorAll("h3");

          // @ts-expect-error
          const texts = [...h3Elements].map((h3) => h3.textContent.trim());
          return texts;
        });

        const fullNameSelector = await page.waitForSelector(".fullname");

        const fullTitle = await fullNameSelector?.evaluate((el) =>
          el.textContent?.trim()
        );

        const person = {
          name: fullTitle,
          emails: emails,
          address: result[i].address,
        };

        allEmails.push(person);

        console.log("scraped", person);

        await page.goBack();
      } catch (error) {
        if (error) {
          console.log("reloading from 1st suspect", error);
          await page.reload();
        }
      }
    }

    try {
      console.log(allEmails);
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const filename = `emails_${timestamp}.txt`;
      const filepath = path.resolve(__dirname, filename); // Change '__dirname' to the appropriate directory if needed

      // Write allEmails to a text file
      fs.writeFile(filepath, JSON.stringify(allEmails), (err) => {
        if (err) {
          console.log("Error writing to file:", err);
        } else {
          console.log(`Emails written to file: ${filename}`);
        }
      });
    } catch (error) {
      console.log(error, "error");
    }
    await browser.close();
  } catch (error) {
    console.log(error, "error");
  }
}
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// listen the channel `message` and resend the received message to the renderer process

ipcMain.on("message", async (event: IpcMainEvent) => {
  console.log("scraping");
  usePuppet({ name: "john", city: "los angeles" });
  setTimeout(() => event.sender.send("message", "hi from electron"), 500);
});
