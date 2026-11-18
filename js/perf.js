// Optimisation : les petits objets lointains (enseignes, bornes, lampes, passants…) ne sont plus dessinés au-delà d'une certaine distance
// de la caméra ; à cette distance, le brouillard les avait déjà presque effacés. On ne touche pas à « visible » (que le jeu utilise
// déjà pour ses propres effets) : l'objet passe simplement sur un calque que la caméra ne regarde pas. Le reflet du sol suit la même règle.
'use strict';

const LOD={list:null,i:0,far:52,v:new THREE.Vector3()};
function lodBuild(){LOD.list=[];const s=new THREE.Sphere();scene.updateMatrixWorld(true);
  scene.traverse(o=>{if(!(o.isMesh||o.isSprite||o.isPoints)||o.isInstancedMesh||!o.geometry)return;
    let p=o;while(p){if(p===player)return;p=p.parent}
    if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();s.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);
    if(s.radius>2.5||s.center.y<-30)return; // les grands volumes restent ; les pièces intérieures ont leur propre réglage
    LOD.list.push({o,r:s.radius,c:o.geometry.boundingSphere.center.clone()})})}
function updateLOD(){if(!started)return;if(!LOD.list){lodBuild();return}
  const L=LOD.list,n=L.length,step=Math.ceil(n/6),cp=camera.position,far=zoneOf()&&String(zoneOf()).startsWith('in_')?1e9:LOD.far; // un sixième de la liste par image
  for(let k=0;k<step;k++){const e=L[LOD.i];LOD.i=(LOD.i+1)%n;if(!e)continue;LOD.v.copy(e.c).applyMatrix4(e.o.matrixWorld);
    const away=LOD.v.distanceTo(cp)-e.r>far;e.o.layers.set(away?1:0)}}
