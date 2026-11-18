// Baseline RGB TIFF, 24-bit Windows BMP and binary PPM all store raw RGB samples.
export function rgbFile(kind:string,w:number,h:number,rgba:Uint8ClampedArray) {
  const bmp=kind==='image/bmp', tiff=kind==='image/tiff'
  const entries=10, bitsOffset=8+2+12*entries+4
  const prefix=new TextEncoder().encode('P6\n'+w+' '+h+'\n255\n')
  const offset=bmp?54:tiff?bitsOffset+6:prefix.length
  const stride=bmp?Math.ceil(w*3/4)*4:w*3
  const data=new Uint8Array(offset+stride*h),view=new DataView(data.buffer)
  const u16=(p:number,v:number)=>view.setUint16(p,v,true)
  const u32=(p:number,v:number)=>view.setUint32(p,v,true)
  if(bmp){
    u16(0,0x4d42);u32(2,data.length);u32(10,54);u32(14,40);u32(18,w);u32(22,h);u16(26,1);u16(28,24);u32(34,stride*h)
  }else if(tiff){
    u16(0,0x4949);u16(2,42);u32(4,8);u16(8,entries)
    const tags=[[256,4,1,w],[257,4,1,h],[258,3,3,bitsOffset],[259,3,1,1],[262,3,1,2],[273,4,1,offset],[277,3,1,3],[278,4,1,h],[279,4,1,stride*h],[284,3,1,1]]
    tags.forEach(([tag,type,count,value],i)=>{const p=10+i*12;u16(p,tag);u16(p+2,type);u32(p+4,count);u32(p+8,value)})
    for(let i=0;i<3;i++)u16(bitsOffset+2*i,8)
  }else data.set(prefix)
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const s=4*(y*w+x),t=offset+(bmp?h-1-y:y)*stride+3*x
    data[t]=rgba[s+(bmp?2:0)];data[t+1]=rgba[s+1];data[t+2]=rgba[s+(bmp?0:2)]
  }
  return new Blob([data],{type:kind})
}

export function iconFile(png:Blob,w:number,h:number){
  const header=new Uint8Array(22),v=new DataView(header.buffer)
  v.setUint16(2,1,true);v.setUint16(4,1,true);header[6]=w%256;header[7]=h%256
  v.setUint16(10,1,true);v.setUint16(12,32,true);v.setUint32(14,png.size,true);v.setUint32(18,22,true)
  return new Blob([header,png],{type:'image/x-icon'})
}
