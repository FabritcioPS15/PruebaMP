import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

    // GET /cotizaciones
    if (path === "/cotizaciones" && req.method === "GET") {
      const res = await fetch(`${supabaseUrl}/rest/v1/cotizaciones?select=*&order=created_at.desc`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      });
      const data = await res.json();
      return jsonResponse(data);
    }

    // GET /cotizaciones/:id
    if (path.startsWith("/cotizaciones/") && req.method === "GET") {
      const id = path.split("/")[2];
      const res = await fetch(`${supabaseUrl}/rest/v1/cotizaciones?id=eq.${id}&select=*`, {
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
      });
      const data = await res.json();
      return jsonResponse(data[0] || null);
    }

    // POST /cotizaciones
    if (path === "/cotizaciones" && req.method === "POST") {
      const body = await req.json();
      const res = await fetch(`${supabaseUrl}/rest/v1/cotizaciones`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          nombre: body.nombre,
          whatsapp: body.whatsapp,
          email: body.email || null,
          tipo_mueble: body.tipoMueble,
          ancho: body.ancho,
          alto: body.alto,
          profundidad: body.profundidad || null,
          color_melamina: body.colorMelamina,
          acabado: body.acabado,
          descripcion_adicional: body.descripcionAdicional || null,
          fotos: body.fotos || null,
        }),
      });
      const data = await res.json();
      return jsonResponse(data);
    }

    // POST /cotizaciones/:id/cotizar
    if (path.match(/^\/cotizaciones\/[^/]+\/cotizar$/) && req.method === "POST") {
      const id = path.split("/")[2];
      const body = await req.json();
      const res = await fetch(`${supabaseUrl}/rest/v1/cotizaciones?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          precio_final: body.precioFinal,
          estado: "cotizada",
        }),
      });
      const data = await res.json();
      return jsonResponse(data);
    }

    // POST /pagos/crear
    if (path === "/pagos/crear" && req.method === "POST") {
      const body = await req.json();
      const res = await fetch(`${supabaseUrl}/rest/v1/pagos`, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          cotizacion_id: body.cotizacionId,
          monto: body.monto,
          metodo: "tarjeta",
          estado: "completado",
          culqi_token: body.culqiToken || null,
        }),
      });
      const data = await res.json();

      // Update cotizacion estado to pagada
      await fetch(`${supabaseUrl}/rest/v1/cotizaciones?id=eq.${body.cotizacionId}`, {
        method: "PATCH",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: "pagada" }),
      });

      return jsonResponse(data);
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
