/** Scroll-scrubbed honey-jar finale, isolated from the page/river controller. */

/** Return normalized fill progress directly from scroll position; naturally reversible. */
export function getHoneyJarProgress(scrollY, jarTop, jarHeight, viewportHeight) {
  const travel = Math.max(1, jarHeight - viewportHeight);
  return Math.min(1, Math.max(0, (scrollY - jarTop) / travel));
}

export function setupHoneyJar(section) {
  const parts={
    rect:section.querySelector('#liquidRect'), surface:section.querySelector('#liquidSurface'),
    bubbles:section.querySelector('#liquidBubbles'), lid:section.querySelector('#jarLid'),
    label:section.querySelector('#jarLabel'), drips:section.querySelector('#dripGroup'),
    firstDrop:section.querySelector('.drop-a'), secondDrop:section.querySelector('.drop-b'),
    impact:section.querySelector('#honeyImpact'), percent:section.querySelector('#fillPercent'),
    meter:section.querySelector('#fillMeter'), caption:section.querySelector('#jarCaption'),
    cta:section.querySelector('#jarShopCta')
  };
  let lastProgress=-1;

  /** Update the jar from cached document geometry; returns whether the jar is in view. */
  return function renderHoneyJar(viewportHeight,scrollY,jarTop,jarHeight,scrollSpeed=0) {
    const jarTopViewport=jarTop-scrollY;
    const progress=getHoneyJarProgress(scrollY,jarTop,jarHeight,viewportHeight);
    if (Math.abs(progress-lastProgress)<.0005 && section.dataset.fill!==undefined) {
      return jarTopViewport<viewportHeight*.9 && jarTopViewport+jarHeight>0;
    }
    lastProgress=progress;
    const fillHeight=progress*269;
    const surfaceY=458-fillHeight;
    const finishedRaw=Math.min(1,Math.max(0,(progress-.88)/.12));
    const finished=finishedRaw*finishedRaw*(3-2*finishedRaw);
    const displayPercent=Math.round(progress*100);
    parts.rect.setAttribute('y',surfaceY.toFixed(2));
    parts.rect.setAttribute('height',fillHeight.toFixed(2));
    const cycle=(progress*28)%1;
    const pulse=Math.max(0,1-Math.abs(cycle-.95)*8);
    const wave=1.15+Math.sin(progress*24*Math.PI)*1.25+pulse*2.2+scrollSpeed*1.8;
    parts.surface.setAttribute('d',`M94 ${surfaceY.toFixed(1)} Q151 ${(surfaceY-wave).toFixed(1)} 210 ${surfaceY.toFixed(1)} T326 ${surfaceY.toFixed(1)}`);
    parts.surface.setAttribute('opacity',progress>.005?'1':'0');
    parts.bubbles.setAttribute('opacity',progress>.04?'.85':'0');
    parts.label.setAttribute('opacity',Math.min(1,Math.max(0,(progress-.72)/.16)).toFixed(3));
    parts.lid.setAttribute('opacity',finished.toFixed(3));
    parts.lid.setAttribute('transform',`translate(0 ${(-31*(1-finished)).toFixed(1)})`);
    const showDrips=progress>.01&&progress<.92;
    parts.drips.setAttribute('opacity',showDrips?'1':'0');
    for(const [drop,shift] of [[parts.firstDrop,0],[parts.secondDrop,.52]]) {
      const phase=(cycle+shift)%1;
      drop.setAttribute('transform',`translate(0 ${(phase*(surfaceY-63)*(1+scrollSpeed*.08)).toFixed(2)})`);
      drop.setAttribute('opacity',showDrips?String(Math.min(1,Math.max(0,(1-phase)*3))):'0');
    }
    parts.impact.setAttribute('cy',surfaceY.toFixed(2));
    parts.impact.setAttribute('rx',(pulse*38).toFixed(2));
    parts.impact.setAttribute('opacity',showDrips?(pulse*.84).toFixed(2):'0');
    parts.percent.textContent=`${displayPercent}%`;
    parts.meter.style.width=`${displayPercent}%`;
    parts.caption.textContent=progress<.005?'একটি খালি বয়াম · গল্পের অপেক্ষায়':progress<.99?'ফোঁটায় ফোঁটায় জমছে সুন্দরবনের মধু':'প্রকৃতির সোনালি উপহার · মৌবন';
    section.classList.toggle('jar-label-ready',progress>=.72);
    parts.cta.hidden=progress<.995;
    section.dataset.fill=displayPercent.toString();
    return jarTopViewport<viewportHeight*.9&&jarTopViewport+jarHeight>0;
  };
}
