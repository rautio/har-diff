interface HAREntry {
  time: number;
}

interface HAR {
  log: {
    entries: HAREntry[];
    version: string;
  };
}

interface FileMessage {
  index: 0 | 1;
  file: File;
}
const files: Record<number, HAR> = {};

self.onmessage = (msg) => {
  console.log({ msg });
  const { index, file } = msg.data;
  var reader = new FileReader();
  reader.onload = function (event) {
    if (event.target) {
      try {
        files[index] = JSON.parse(event.target.result);
        if (files[0] && files[1]) {
          console.log("yes both present", { one: files[0], two: files[1] });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  reader.readAsText(file);
};
