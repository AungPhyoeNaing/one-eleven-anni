import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Heart, Orbit } from "lucide-react";
import { Song, songs } from "../data/songs";

interface GalaxyProps {
  onPlanetClick: (song: Song) => void;
  activeSong: Song;
  isPlaying: boolean;
  onCenterClick: () => void;
  resetView: number;
  motionPaused: boolean;
}
const locations = [
  [4.5, 1.8, -1.2],
  [3.1, -2.5, 1.2],
  [-3.7, -0.65, 1.5],
];
const colors = ["#caa1f6", "#e9a08f", "#86cbd0"];
const vertex = `varying vec3 vNormal; varying vec3 vPosition; varying vec2 vUv;
void main(){ vNormal=normalize(normalMatrix*normal); vPosition=position; vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
const planetFragment = `precision highp float;
varying vec3 vNormal; varying vec3 vPosition; varying vec2 vUv;
uniform vec3 uColor; uniform float uTime; uniform float uActive;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){float n=noise(vPosition*4.+vec3(uTime*.025,0.,0.));float bands=sin(vPosition.y*22.+n*5.)*.5+.5;float fine=sin(vPosition.y*95.+n*10.)*.5+.5;
vec3 color=mix(uColor*.55,uColor*1.25,bands*.6+n*.4);color+=fine*.06;
float light=max(dot(normalize(vNormal),normalize(vec3(-.6,.8,1.))),0.);float rim=pow(1.-max(vNormal.z,0.),3.);
color*=.11+light*.89; color+=uColor*rim*(.24+uActive*.3);gl_FragColor=vec4(color,1.); }`;
const starVertex = `attribute float aSize;attribute vec3 aColor;varying vec3 vColor;uniform float uTime;uniform float uPixelRatio;
void main(){vColor=aColor;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(12.,aSize*uPixelRatio*(110./max(1.,-mv.z)));}`;
const starFragment = `varying vec3 vColor;uniform float uOpacity;void main(){float d=length(gl_PointCoord-.5);float glow=exp(-d*d*22.);float core=exp(-d*d*120.);gl_FragColor=vec4(vColor, (glow*.45+core*.7)*uOpacity);}`;

export default function Galaxy(props: GalaxyProps) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const photoLabel = useRef<HTMLButtonElement>(null);
  const live = useRef(props);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  useEffect(() => {
    live.current = props;
  });
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setStatus("fallback");
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor("#070916", 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.prepend(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive three-dimensional galaxy. Drag or use arrow keys to orbit. Press Home to reset. Song and photo buttons follow the scene.",
    );
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 160);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 11;
    controls.maxDistance = 34;
    controls.minPolarAngle = Math.PI * 0.32;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.minAzimuthAngle = -0.52;
    controls.maxAzimuthAngle = 0.52;
    controls.rotateSpeed = 0.35;
    controls.zoomSpeed = 0.5;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let mobile = false;
    let frame = 0;
    let disposed = false;
    let manual = false;
    let transition = false;
    let seenSong = live.current.activeSong.id;
    let seenReset = live.current.resetView;
    let elapsed = 0;
    let last = performance.now();
    const desiredCamera = new THREE.Vector3();
    const desiredTarget = new THREE.Vector3();
    const point = new THREE.Vector3();
    const loader = new THREE.TextureLoader();
    const resources: THREE.Texture[] = [];
    const interactive: THREE.Object3D[] = [];
    const planetGroups: THREE.Group[] = [];
    const planetMaterials: THREE.ShaderMaterial[] = [];
    const labelPoints: THREE.Vector3[] = [];

    // A single cloud of points draws the spiral dust instead of thousands of separate meshes.
    function makeStars(count: number, spiral: boolean) {
      const positions = new Float32Array(count * 3),
        sizes = new Float32Array(count),
        shades = new Float32Array(count * 3);
      const palette = [
        new THREE.Color("#dac8ff"),
        new THREE.Color("#7daddd"),
        new THREE.Color("#e6c5d8"),
        new THREE.Color("#ffffff"),
      ];
      for (let i = 0; i < count; i++) {
        const seed = (n: number) => {
          const value = Math.sin(i * 127.1 + n * 311.7) * 43758.5453;
          return value - Math.floor(value);
        };
        if (spiral) {
          const radius = 1.9 + Math.pow(seed(1), 0.7) * 9;
          const arm =
            ((i % 3) * Math.PI * 2) / 3 + radius * 0.46 + (seed(2) - 0.5) * 0.6;
          positions.set(
            [
              Math.cos(arm) * radius,
              (seed(3) - 0.5) * (0.35 + radius * 0.055),
              Math.sin(arm) * radius,
            ],
            i * 3,
          );
        } else {
          positions.set(
            [(seed(1) - 0.5) * 105, (seed(2) - 0.5) * 75, -20 - seed(3) * 65],
            i * 3,
          );
        }
        sizes[i] = spiral
          ? 0.15 + seed(4) * 0.34
          : 0.5 + Math.pow(seed(4), 7) * 2.4;
        const color = palette[Math.floor(seed(5) * palette.length)];
        shades.set([color.r, color.g, color.b], i * 3);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("aColor", new THREE.BufferAttribute(shades, 3));
      return new THREE.Points(
        geometry,
        new THREE.ShaderMaterial({
          vertexShader: starVertex,
          fragmentShader: starFragment,
          uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: renderer.getPixelRatio() },
            uOpacity: { value: spiral ? 0.9 : 0.95 },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
    }
    const stars = makeStars(1600, false);
    scene.add(stars);
    const dust = makeStars(6500, true);
    dust.rotation.set(0.25, 0, -0.16);
    dust.position.set(0, -0.3, -2.6);
    scene.add(dust);

    // Procedural nebula: softly layered noise with transparent edges, rendered behind the keepsake.
    const nebula = new THREE.Mesh(
      new THREE.PlaneGeometry(64, 38),
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: `varying vec2 vUv; uniform float uTime;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){return n(p)*.5+n(p*2.1)*.25+n(p*4.3)*.125+n(p*8.2)*.0625;}
void main(){vec2 p=vUv;float cloud=fbm(p*6.+vec2(uTime*.006,0.));float ribbon=exp(-pow((p.y-.5)+sin(p.x*5.)*.17+(cloud-.5)*.35,2.)*35.);float edge=smoothstep(0.,.25,p.x)*smoothstep(1.,.7,p.x);vec3 c=mix(vec3(.16,.24,.55),vec3(.65,.22,.48),smoothstep(.25,.8,p.x));float alpha=ribbon*cloud*edge*.8;gl_FragColor=vec4(c,alpha);}`,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    nebula.position.set(-1, 2, -19);
    scene.add(nebula);

    // The real photo is framed as a small physical object, never distorted onto a sphere.
    const keepsake = new THREE.Group();
    keepsake.position.set(0, 0.45, 0);
    keepsake.rotation.set(-0.06, -0.18, 0.09);
    scene.add(keepsake);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: "#e9d8ec",
      metalness: 0.5,
      roughness: 0.25,
    });
    const backing = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 2.85, 0.13),
      frameMaterial,
    );
    backing.userData.photo = true;
    keepsake.add(backing);
    interactive.push(backing);
    const photoTexture = loader.load(
      "/images/central-star-photo.webp",
      () => {
        if (!disposed) setStatus("ready");
      },
      undefined,
      () => {
        if (!disposed) setStatus("ready");
      },
    );
    photoTexture.colorSpace = THREE.SRGBColorSpace;
    resources.push(photoTexture);
    const photo = new THREE.Mesh(
      new THREE.PlaneGeometry(2.51, 2.28),
      new THREE.MeshBasicMaterial({ map: photoTexture }),
    );
    photo.position.set(0, 0.12, 0.078);
    photo.userData.photo = true;
    keepsake.add(photo);
    interactive.push(photo);
    const orbit = new THREE.Group();
    orbit.rotation.set(0.4, 0.3, -0.32);
    keepsake.add(orbit);
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(2.07, 0.009, 6, 180),
      new THREE.MeshBasicMaterial({
        color: "#d5ade6",
        transparent: true,
        opacity: 0.5,
      }),
    );
    orbit.add(arc);
    const arc2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.28, 0.005, 6, 180),
      new THREE.MeshBasicMaterial({
        color: "#94bce1",
        transparent: true,
        opacity: 0.25,
      }),
    );
    arc2.rotation.x = 0.5;
    orbit.add(arc2);
    const signatureCanvas = document.createElement("canvas");
    signatureCanvas.width = 512;
    signatureCanvas.height = 80;
    const signatureContext = signatureCanvas.getContext("2d");
    if (signatureContext) {
      signatureContext.font = "italic 34px Georgia";
      signatureContext.fillStyle = "#5b3c62";
      signatureContext.textAlign = "center";
      signatureContext.fillText("us, in every lifetime.", 256, 49);
    }
    const signatureTexture = new THREE.CanvasTexture(signatureCanvas);
    resources.push(signatureTexture);
    const signature = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.34),
      new THREE.MeshBasicMaterial({
        map: signatureTexture,
        transparent: true,
        depthWrite: false,
      }),
    );
    signature.position.set(0, -1.19, 0.079);
    keepsake.add(signature);
    const light = new THREE.PointLight("#e8c7f3", 35, 30, 2);
    light.position.set(-3, 7, 8);
    scene.add(light);
    scene.add(new THREE.AmbientLight("#b1a6d9", 2));
    const rimLight = new THREE.PointLight("#729edc", 18, 30, 2);
    rimLight.position.set(5, -2, 5);
    scene.add(rimLight);

    songs.forEach((song, index) => {
      const group = new THREE.Group();
      group.position.fromArray(locations[index]);
      scene.add(group);
      planetGroups.push(group);
      const radius = [1.12, 0.78, 0.72][index];
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: planetFragment,
        uniforms: {
          uColor: { value: new THREE.Color(colors[index]) },
          uTime: { value: 0 },
          uActive: { value: 0 },
        },
      });
      planetMaterials.push(material);
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 48, 32),
        material,
      );
      sphere.rotation.z = [-0.25, 0.15, -0.2][index];
      sphere.userData.song = song;
      group.add(sphere);
      interactive.push(sphere);
      if (index === 0) {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(1.45, 2.04, 100),
          new THREE.MeshBasicMaterial({
            color: "#bda3d7",
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.42,
            depthWrite: false,
          }),
        );
        ring.rotation.set(1.14, 0.18, 0.15);
        ring.userData.song = song;
        group.add(ring);
        interactive.push(ring);
        [1.45, 1.57, 1.92, 2.04].forEach((r, i) => {
          const line = new THREE.Mesh(
            new THREE.TorusGeometry(r, 0.005, 4, 120),
            new THREE.MeshBasicMaterial({
              color: "#e2c8ed",
              transparent: true,
              opacity: i % 2 ? 0.2 : 0.6,
            }),
          );
          line.rotation.copy(ring.rotation);
          group.add(line);
        });
      }
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.035, 32, 24),
        new THREE.ShaderMaterial({
          vertexShader: vertex,
          fragmentShader: `varying vec3 vNormal; uniform vec3 uColor; void main(){float f=pow(1.-abs(vNormal.z),4.);gl_FragColor=vec4(uColor,f*.42);}`,
          uniforms: { uColor: { value: new THREE.Color(colors[index]) } },
          transparent: true,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          depthWrite: false,
        }),
      );
      group.add(halo);
      labelPoints.push(new THREE.Vector3(0, -radius - 0.4, 0));
    });

    // One quiet constellation, drawn like a handwritten heart in the distance.
    const heartPoints = Array.from({ length: 65 }, (_, i) => {
      const t = (i / 64) * Math.PI * 2;
      return new THREE.Vector3(
        Math.pow(Math.sin(t), 3) * 1.25,
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)) *
          0.075,
        0,
      );
    });
    const constellation = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(heartPoints),
      new THREE.LineBasicMaterial({
        color: "#caa5d5",
        transparent: true,
        opacity: 0.16,
      }),
    );
    constellation.position.set(-4.5, 4, -7);
    constellation.rotation.z = 0.13;
    scene.add(constellation);

    function home() {
      manual = false;
      transition = true;
      desiredTarget.set(mobile ? 0 : -3, 0, 0);
      desiredCamera.set(
        mobile ? 0 : -3,
        mobile ? 1.6 : 2.7,
        mobile ? 12 : 17.8,
      );
    }
    function resize() {
      const width = container!.clientWidth,
        height = container!.clientHeight;
      mobile = width <= 960;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.fov = mobile ? 49 : 43;
      camera.updateProjectionMatrix();
      planetGroups[0].position.set(
        mobile ? 3.1 : 4.5,
        mobile ? 2.2 : 1.8,
        -1.2,
      );
      planetGroups[1].position.set(
        mobile ? 2.6 : 3.3,
        mobile ? -1.7 : -1.5,
        0.5,
      );
      planetGroups[2].position.set(
        mobile ? -3.3 : -3.7,
        mobile ? -1.1 : -0.65,
        1.5,
      );
      controls.minDistance = mobile ? 10 : 11;
      home();
      camera.position.copy(desiredCamera);
      controls.target.copy(desiredTarget);
      controls.update();
    }
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Home") {
        event.preventDefault();
        home();
        return;
      }
      if (
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "+",
          "-",
          "=",
        ].includes(event.key)
      )
        return;
      event.preventDefault();
      manual = true;
      transition = false;
      const spherical = new THREE.Spherical().setFromVector3(
        camera.position.clone().sub(controls.target),
      );
      if (event.key === "ArrowLeft") spherical.theta -= 0.075;
      if (event.key === "ArrowRight") spherical.theta += 0.075;
      if (event.key === "ArrowUp") spherical.phi -= 0.06;
      if (event.key === "ArrowDown") spherical.phi += 0.06;
      if (event.key === "+" || event.key === "=") spherical.radius *= 0.92;
      if (event.key === "-") spherical.radius *= 1.08;
      spherical.theta = THREE.MathUtils.clamp(
        spherical.theta,
        controls.minAzimuthAngle,
        controls.maxAzimuthAngle,
      );
      spherical.phi = THREE.MathUtils.clamp(
        spherical.phi,
        controls.minPolarAngle,
        controls.maxPolarAngle,
      );
      spherical.radius = THREE.MathUtils.clamp(
        spherical.radius,
        controls.minDistance,
        controls.maxDistance,
      );
      camera.position
        .copy(controls.target)
        .add(new THREE.Vector3().setFromSpherical(spherical));
      controls.update();
    };
    renderer.domElement.addEventListener("keydown", keyboard);
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    controls.addEventListener("start", () => {
      manual = true;
      transition = false;
    });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0,
      downY = 0;
    const down = (event: PointerEvent) => {
      downX = event.clientX;
      downY = event.clientY;
    };
    const pick = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 7) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(interactive, false)[0];
      if (hit?.object.userData.photo) live.current.onCenterClick();
      else if (hit?.object.userData.song)
        live.current.onPlanetClick(hit.object.userData.song);
    };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", pick);
    const contextLost = (event: Event) => {
      event.preventDefault();
      setStatus("fallback");
      cancelAnimationFrame(frame);
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    function placeLabel(element: HTMLElement | null, position: THREE.Vector3) {
      if (!element) return;
      point.copy(position).project(camera);
      element.style.transform = `translate(-50%, -50%) translate(${(point.x * 0.5 + 0.5) * container!.clientWidth}px, ${(-point.y * 0.5 + 0.5) * container!.clientHeight}px)`;
      element.style.visibility = point.z > 1 ? "hidden" : "visible";
    }
    function animate(now: number) {
      if (disposed || document.hidden) return;
      if (now - last < 1000 / (mobile ? 30 : 45)) {
        frame = requestAnimationFrame(animate);
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reducedMotion.matches && !live.current.motionPaused) elapsed += dt;
      if (seenReset !== live.current.resetView) {
        seenReset = live.current.resetView;
        home();
      }
      if (seenSong !== live.current.activeSong.id) {
        seenSong = live.current.activeSong.id;
        manual = false;
        transition = true;
        const index = songs.findIndex((song) => song.id === seenSong);
        const position = planetGroups[index].position;
        desiredTarget.set(
          (mobile ? 0 : -3) + position.x * 0.16,
          position.y * 0.13,
          0,
        );
        desiredCamera.set(
          desiredTarget.x,
          (mobile ? 1.6 : 2.7) + position.y * 0.2,
          mobile ? 11.5 : 16,
        );
      }
      if (transition && !manual) {
        const ease = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 2.2);
        camera.position.lerp(desiredCamera, ease);
        controls.target.lerp(desiredTarget, ease);
        if (camera.position.distanceTo(desiredCamera) < 0.015)
          transition = false;
      }
      controls.update();
      dust.rotation.y = elapsed * 0.012;
      nebula.material.uniforms.uTime.value = elapsed;
      keepsake.rotation.y = -0.18 + Math.sin(elapsed * 0.18) * 0.065;
      keepsake.position.y = 0.45 + Math.sin(elapsed * 0.55) * 0.07;
      orbit.rotation.y = elapsed * 0.045;
      planetGroups.forEach((group, index) => {
        const sphere = group.children[0];
        sphere.rotation.y = elapsed * 0.045;
        planetMaterials[index].uniforms.uTime.value = elapsed;
        planetMaterials[index].uniforms.uActive.value =
          live.current.activeSong.id === songs[index].id &&
          live.current.isPlaying
            ? 1
            : 0;
        const label = labelPoints[index].clone().add(group.position);
        placeLabel(labels.current[index], label);
      });
      placeLabel(photoLabel.current, new THREE.Vector3(0, -1.42, 0.3));
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    frame = requestAnimationFrame(animate);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      controls.dispose();
      renderer.domElement.removeEventListener("keydown", keyboard);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", pick);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.Line
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      resources.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div ref={host} className={`galaxy-canvas scene-${status}`}>
      {status === "loading" && (
        <div className="scene-loading" role="status">
          <Orbit size={22} /> Gathering a little stardust…
        </div>
      )}
      {status === "fallback" && (
        <div className="galaxy-fallback">
          <img
            src="/images/central-star-photo.webp"
            alt="APN and Jia together"
          />
          <p>
            Your galaxy is here, even without 3D.
            <br />
            Choose a song below and stay a little.
          </p>
        </div>
      )}
      <button
        ref={photoLabel}
        className="space-label keepsake-label"
        onClick={props.onCenterClick}
        aria-label="Open our photo"
      >
        <Heart size={11} />
        <span>Our little forever</span>
        <small>Open this memory</small>
      </button>
      {songs.map((song, index) => (
        <button
          ref={(element) => {
            labels.current[index] = element;
          }}
          key={song.id}
          className={`space-label space-label-${index} ${props.activeSong.id === song.id && props.isPlaying ? "is-playing" : ""}`}
          onClick={() => props.onPlanetClick(song)}
          aria-label={`${props.activeSong.id === song.id && props.isPlaying ? "Pause" : "Play"} ${song.track}, ${song.title}`}
        >
          <span className="planet-label-dot" />
          <span>{song.title}</span>
          <small>{song.artist}</small>
        </button>
      ))}
    </div>
  );
}
