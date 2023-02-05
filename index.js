function test() {
    var input, file, fr;

    if (typeof window.FileReader !== 'function') {
        bodyAppend("p", "The file API isn't supported on this browser yet.");
        return;
    }

    input = document.getElementById('file');
    if (!input) {
        bodyAppend("p", "Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
        bodyAppend("p", "This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
        bodyAppend("p", "Please select a file before clicking 'Load'");
    }
    else {
        file = input.files[0];
        fr = new FileReader();
        fr.onload = receivedBinary;
        fr.readAsBinaryString(file);
    }

    function receivedBinary() {
        showResult(fr, "Binary");
    }
    function showResult(fr, label) {
        var big_array, result, n = 4, aByte, byteStr;

        big_array = [];
        result = fr.result;
        while(n< result.length){
            let small_array = new Array;
            let row_length = 0;
            for(let i=0;i<17;i++, n++){
                aByte = result.charCodeAt(n);
                if(9<=i && i<=12){
                    console.log(aByte)
                    let multiple = 1;
                    for(let j=9; j<i;j++){
                        multiple*=16;
                    }
                    row_length += (aByte)*multiple;
                }
                byteStr = aByte.toString(16);
                if (byteStr.length < 2) {
                    byteStr = "0" + byteStr;
                }
                small_array.push(byteStr);
            }
            console.log(row_length)
            for (let i=0; i < row_length - 17;i++, n++) {
                aByte = result.charCodeAt(n);
                byteStr = aByte.toString(16);
                if (byteStr.length < 2) {
                    byteStr = "0" + byteStr;
                }
                small_array.push(byteStr);
            }
            big_array.push(small_array);
        }
        console.log(big_array);
    }

    function bodyAppend(tagName, innerHTML) {
        var elm;

        elm = document.createElement(tagName);
        elm.innerHTML = innerHTML;
        document.body.appendChild(elm);
    }
}