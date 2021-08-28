import config from "../../config/config.js";
import { USDZExporter } from "https://cdn.skypack.dev/three@0.131.3/examples/jsm/exporters/USDZExporter.js";
import { GLTFExporter } from "https://cdn.skypack.dev/three@0.131.3/examples/jsm/exporters/GLTFExporter.js";

const { API_BASE_URL } = config;

const getMobileOS = () => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) {
    return "Android";
  } else if (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "iOS";
  }
  return "Other";
};

async function viewAR(mainModel) {
  const os = getMobileOS();
  if (os === "Android") {
    const exporter = new GLTFExporter();
    exporter.parse(
      mainModel,
      async function (result) {
        if (result instanceof ArrayBuffer) {
          const blob = new Blob([result], {
            type: "application/octet-stream",
          });

          const ipify = await fetch("https://api.ipify.org?format=json");
          const ip = await ipify.json();

          var fd = new FormData();
          fd.append("upl", blob, `${ip.ip.replaceAll(".", "_")}.glb`);
          const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: "post",
            body: fd,
          });
          const res = await response.json();
          const link = document.getElementById("link");
          // console.log(URL.createObjectURL(blob));
          link.download = "scene.glb";
          // const modelLink = `${window.location.href.split("/").slice(0, -1).join("/")}/scene.glb`
          const modelLink = `${API_BASE_URL}/${res.filename}`;
          // link.href = URL.createObjectURL(blob)
          link.href = `intent://arvr.google.com/scene-viewer/1.0?file=${modelLink}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
          // link.href = `intent://arvr.google.com/scene-viewer/1.0?file=${URL.createObjectURL(blob)}#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`
          link.click();
        } else {
          const output = JSON.stringify(result, null, 2);
          console.log(output);
          // saveString( output, 'scene.gltf' );
        }
      },
      {
        binary: true,
      }
    );
  }
  if (os === "iOS") {
    const exporter = new USDZExporter();
    const arraybuffer = await exporter.parse(mainModel);
    const blob = new Blob([arraybuffer], {
      type: "application/octet-stream",
    });

    const link = document.getElementById("link");
    link.download = "scene.usdz";
    link.href = URL.createObjectURL(blob);
    link.click();
  }
}

export { getMobileOS, viewAR };
