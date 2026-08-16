const supabase = require("./supabaseClient");

function ensureSupabaseConfigured() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        );
    }
}

function mapDevice(row) {
    return {
        name: row.name,
        brand: row.brand,
        type: row.type,
        connectionType: row.connection_type,
        serial: row.serial || "",
        ip: row.ip || "",
        port: row.port || "",
        username: row.username || "",
        password: row.password || "",
        channels: Number(row.channels || 0),
        id: row.id,
        createdAt: row.created_at
    };
}

async function getAllDevices() {
    ensureSupabaseConfigured();

    const { data, error } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        throw error;
    }

    return (data || []).map(mapDevice);
}

async function getDeviceById(id) {
    ensureSupabaseConfigured();

    const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data ? mapDevice(data) : null;
}

async function addDevice(device) {
    ensureSupabaseConfigured();

    const payload = {
        name: device.name,
        brand: device.brand || "generic",
        type: device.type || "dvr",
        connection_type: device.connectionType || "IP",
        serial: device.serial || "",
        ip: device.ip || "",
        port: device.port || "",
        username: device.username || "",
        password: device.password || "",
        channels: Number(device.channels || 0)
    };

    const { data, error } = await supabase
        .from("devices")
        .insert(payload)
        .select("*")
        .single();

    if (error) {
        throw error;
    }

    return mapDevice(data);
}

async function deleteDevice(id) {
    ensureSupabaseConfigured();

    const { error } = await supabase
        .from("devices")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }

    return true;
}

module.exports = {
    getAllDevices,
    getDeviceById,
    addDevice,
    deleteDevice
};
