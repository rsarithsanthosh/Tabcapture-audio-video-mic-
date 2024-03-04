let allowButton=document.getElementById("allow-mic")
allowButton.addEventListener("click",async()=>{
    await navigator.mediaDevices.getUserMedia({
        audio:true
    })
})