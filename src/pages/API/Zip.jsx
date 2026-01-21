
import {
    BlobWriter,
    HttpReader,
    ZipWriter,
} from "@zip.js/zip.js";

const Zip = {
    "getZipFileBlob": async (urls, onProgress) => {
        const zipWriter = new ZipWriter(new BlobWriter());

        for (let i = 0; i < urls.length; i++) {
            const { fileName, url } = urls[i];
            await zipWriter.add(fileName, new HttpReader(url));
            if (onProgress) onProgress(i + 1, urls.length); // Update progress
        }

        return zipWriter.close();
    }
    ,
    "downloadFile" : (blob,zipname) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', zipname+".zip");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    }
}





export default Zip;
