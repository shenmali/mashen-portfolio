// shader-bg.jsx — fullscreen WebGL fragment shader background.
// FBM plasma flow + perspective grid horizon + depth fog, matrix-green.
// Props: accent (hex), intensity (0..1 anim energy), power (0..1 npc→superuser), speed (0..2)

const ShaderBG = ({ accent = "#39ff88", intensity = 0.6, power = 0, speed = 1 }) => {
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({ intensity, power, speed, accent });
  const mouseRef = React.useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const powerAnimRef = React.useRef(power);

  // keep latest props without re-initializing GL
  React.useEffect(() => {
    stateRef.current = { intensity, power, speed, accent };
  }, [intensity, power, speed, accent]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;

    const vert = `
      attribute vec2 p;
      void main() { gl_Position = vec4(p, 0.0, 1.0); }
    `;

    const frag = `
      precision highp float;
      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;
      uniform float u_intensity;
      uniform float u_power;
      uniform vec3  u_accent;

      float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
      float noise(vec2 x){
        vec2 i = floor(x); vec2 f = fract(x);
        float a = hash(i);
        float b = hash(i+vec2(1.0,0.0));
        float c = hash(i+vec2(0.0,1.0));
        float d = hash(i+vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
      }
      float fbm(vec2 x){
        float v = 0.0; float a = 0.5;
        for(int i=0;i<5;i++){ v += a*noise(x); x = x*2.0 + 7.13; a *= 0.5; }
        return v;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 p  = (gl_FragCoord.xy*2.0 - u_res) / u_res.y;
        float t = u_time * (0.04 + 0.05*u_intensity);

        // flowing domain-warped fbm
        vec2 q = p*1.35 + u_mouse*0.35;
        float n1 = fbm(q + vec2(t, t*0.6));
        float n2 = fbm(q*1.8 - vec2(t*0.9, t*0.2) + n1);
        float flow = fbm(q + n2*1.2 + vec2(0.0, -t*0.5));

        vec3 col = vec3(0.006, 0.024, 0.012);

        // green energy from flow, intensified by power
        float g = smoothstep(0.30, 0.92, flow);
        float energy = (0.11 + 0.20*u_power) * (0.55 + 0.85*u_intensity);
        col += u_accent * g * energy;

        // bright filaments (ridged)
        float ridge = 1.0 - abs(n2 - 0.5)*2.0;
        ridge = pow(max(ridge,0.0), 3.5);
        col += u_accent * ridge * (0.07 + 0.13*u_power);

        // perspective horizon grid (lower half), receding
        float horizon = 0.18;
        if (p.y < horizon) {
          float depth = (horizon - p.y);
          float persp = 1.0 / (depth*3.2 + 0.12);
          float gx = abs(fract(p.x * persp * 0.9 + 0.5) - 0.5);
          float gz = abs(fract((depth*persp*1.4) - t*0.6) - 0.5);
          float lineX = smoothstep(0.5, 0.46, gx);
          float lineZ = smoothstep(0.5, 0.45, gz);
          float grid = max(lineX, lineZ);
          float fade = smoothstep(0.0, 0.55, depth) * (1.0 - smoothstep(0.9, 1.6, depth));
          col += u_accent * grid * fade * (0.16 + 0.20*u_power);
        }

        // scanline + grain
        float scan = 0.96 + 0.04*sin(gl_FragCoord.y*2.2 + u_time*2.0);
        col *= scan;
        float grain = hash(uv + fract(u_time)) * 0.05;
        col += grain * 0.4;

        // vignette
        float vig = smoothstep(1.5, 0.25, length(p*vec2(0.85,1.0)));
        col *= 0.35 + 0.65*vig;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("shader compile error", gl.getShaderInfoLog(s));
      }
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      intensity: gl.getUniformLocation(prog, "u_intensity"),
      power: gl.getUniformLocation(prog, "u_power"),
      accent: gl.getUniformLocation(prog, "u_accent"),
    };

    const hexToRgb = (hex) => {
      const m = hex.replace("#", "");
      const n = parseInt(m.length === 3 ? m.split("").map(c=>c+c).join("") : m, 16);
      return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255];
    };

    let raf, pid, start = performance.now();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(canvas.offsetWidth * dpr);
      canvas.height = Math.floor(canvas.offsetHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (reduced) frame(0, true);
    };

    const onMove = (e) => {
      mouseRef.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const frame = (now, fixed) => {
      const st = stateRef.current;
      const m = mouseRef.current;
      if (fixed) {
        m.x = m.tx; m.y = m.ty; powerAnimRef.current = st.power;
      } else {
        m.x += (m.tx - m.x) * 0.05;
        m.y += (m.ty - m.y) * 0.05;
        powerAnimRef.current += (st.power - powerAnimRef.current) * 0.06;
      }
      const tSec = fixed ? 2.2 : ((now - start) / 1000) * (st.speed || 1);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, tSec);
      gl.uniform2f(U.mouse, m.x, m.y);
      gl.uniform1f(U.intensity, st.intensity);
      gl.uniform1f(U.power, powerAnimRef.current);
      gl.uniform3fv(U.accent, hexToRgb(st.accent));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);

    if (reduced) {
      // static, low-motion frame; redraw only when tweaks change
      frame(0, true);
      let last = JSON.stringify(stateRef.current);
      pid = setInterval(() => {
        const cur = JSON.stringify(stateRef.current);
        if (cur !== last) { last = cur; frame(0, true); }
      }, 220);
    } else {
      const loop = (now) => { frame(now, false); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(pid);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="layer layer-shader" aria-hidden="true" />;
};

window.ShaderBG = ShaderBG;
