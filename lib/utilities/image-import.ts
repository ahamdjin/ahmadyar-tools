export async function displayBlob(file:File):Promise<Blob>{
  const tiff=/\.tiff?$/i.test(file.name)||file.type==='image/tiff'
  if(!tiff&&!/\.ppm$/i.test(file.name)&&file.type!=='image/x-portable-pixmap')return file
  const buffer=await file.arrayBuffer()
  let w:number,h:number,pixels:Uint8Array
  if(tiff){
    const utif=await import('utif')
    const [page]=utif.decode(buffer)
    w=Number(Array.isArray(page?.t256)?page.t256[0]:0);h=Number(Array.isArray(page?.t257)?page.t257[0]:0)
    if(!w||!h||w*h>24000000)throw Error('Unsupported TIFF dimensions.')
    utif.decodeImage(buffer,page);pixels=utif.toRGBA8(page)
  }else{
    const b=new Uint8Array(buffer)
    const header=new TextDecoder('latin1').decode(b.subarray(0,8192))
    const m=/^P6\s+(\d+)\s+(\d+)\s+255(?:\r\n|\s)/.exec(header)
    if(!m)throw Error('Use a binary P6 PPM with 8-bit RGB channels.')
    w=Number(m[1]);h=Number(m[2]);const start=m[0].length
    if(!w||!h||w*h>24000000||b.length-start<w*h*3)throw Error('Invalid PPM dimensions or pixel data.')
    pixels=new Uint8Array(w*h*4)
    for(let i=0;i<w*h;i++){pixels[i*4]=b[start+i*3];pixels[i*4+1]=b[start+i*3+1];pixels[i*4+2]=b[start+i*3+2];pixels[i*4+3]=255}
  }
  const c=document.createElement('canvas');c.width=w;c.height=h
  c.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(pixels),w,h),0,0)
  return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('Could not preview this image.'))))
}
