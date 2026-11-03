package org.firstinspires.ftc.teamcode.jsonloader;

import android.content.Context;
import android.content.res.AssetManager;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.bylazar.configurables.annotations.Configurable;
import com.google.gson.*;
import com.google.gson.annotations.JsonAdapter;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.*;
import com.pedropathing.api.Paths;
import com.pedropathing.math.Pose;
import com.pedropathing.paths.Path;
import com.pedropathing.paths.interpolator.Interpolator;
import com.pedropathing.paths.interpolator.PiecewiseInterpolator;
import com.qualcomm.robotcore.hardware.HardwareMap;
import java.io.*;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.*;

@Configurable
public class PedroJsonLoader {

    static <T> int getSz(Map<String, T> m) {
        return m == null ? -1 : m.size();
    }

    static String sfmt(String format, Object... args) {
        return String.format(Locale.ENGLISH, format, args);
    }

    public static String ExternalFileName = "paths/pedropaths.json";
    public static String AssetFileName = "paths/pedropaths.json";
    public static String status = "";
    public static String other = "other";
    static NamedItems dto;
    public static PedroItems items;

    public HardwareMap hardwareMap;
    public boolean loaded;

    @Nullable
    private InputStream getAdbDeployedFileStream(Context context) {
        try {
            File adbFile = new File(context.getExternalFilesDir(null), ExternalFileName);
            other = adbFile.getAbsolutePath();
            return adbFile.exists() ? new FileInputStream(adbFile) : null;
        } catch (IOException ignored) {}
        return null;
    }

    @Nullable
    private InputStream getAssetFileStream(Context context) {
        AssetManager assetManager = context.getAssets();
        try {
            return assetManager.open(AssetFileName);
        } catch (IOException ignored) {}
        return null;
    }

    @Nullable
    private InputStream getJsonFileStream() {
        Context context = hardwareMap.appContext;
        InputStream adbStream = getAdbDeployedFileStream(context);
        if (adbStream != null) {
            return adbStream;
        }
        InputStream assetStream = getAssetFileStream(context);
        if (assetStream != null) {
            return assetStream;
        }
        status = "Never found any files";
        return null;
    }

    // TODO: add loading from the 'upload only the paths' path, too...
    public boolean loadPathFromJson() {
        InputStream inputStream = getJsonFileStream();
        if (inputStream == null) {
            return false;
        }
        try (Reader reader = new InputStreamReader(inputStream)) {
            Gson gson = new Gson();
            dto = gson.fromJson(reader, NamedItems.class);
            if (dto == null) {
                status = "DTO JSON loading failed";
                return false;
            }
            items = new PedroItems(dto);
            StringBuilder sb = new StringBuilder();
            sb.append(
                sfmt(
                    "vals:%d poses:%d interps:%d curves:%d paths:%d errs:%d",
                    getSz(items.values),
                    getSz(items.poses),
                    getSz(items.interpolations),
                    getSz(items.curves),
                    getSz(items.paths),
                    items.errors.size()
                )
            );
            for (String s : items.errors) {
                sb.append(sfmt("%nErr: %s", s.trim()));
            }
            status = sb.toString();
            return true;
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            e.printStackTrace(pw);
            status += sw.toString();
            return false;
        }
    }

    public PedroJsonLoader(HardwareMap map) {
        this.hardwareMap = map;
        this.loaded = loadPathFromJson();
    }

    @Nullable
    public static Path getPath(String name) {
        return items != null && items.paths != null ? items.paths.get(name) : null;
    }

    @Nullable
    public static Path getCurve(String name) {
        return items != null && items.curves != null ? items.curves.get(name) : null;
    }

    @Nullable
    public static Pose getPose(String name) {
        return items != null && items.poses != null ? items.poses.get(name) : null;
    }

    @Nullable
    public static Double getValue(String name) {
        return items != null && items.values != null ? items.values.get(name) : null;
    }

    static class NamedItems {

        public Map<String, RValue<DTOValue>> values;
        public Map<String, RValue<DTOPose>> poses;
        public Map<String, RValue<DTOInterpolator>> interpolations;
        public Map<String, RValue<DTOCurve>> curves;
        public Map<String, DTOPath> paths;
    }

    static class InterpDescr {

        static class Piece {

            public double until;
            public InterpDescr interp;

            public Piece(double until, InterpDescr id) {
                this.until = until;
                interp = id;
            }
        }

        public char type;
        public boolean revOrLongWay;
        public double heading1X, heading2Y;
        public Piece[] pieces;

        /// Tangent
        public InterpDescr(boolean rev) {
            type = 't';
            revOrLongWay = rev;
        }

        /// Constant
        public InterpDescr(double heading) {
            type = 'c';
            heading1X = heading;
        }

        /// Linear
        public InterpDescr(double start, double end, boolean longWay) {
            type = 'l';
            revOrLongWay = longWay;
            heading1X = start;
            heading2Y = end;
        }

        /// Facing
        public InterpDescr(double x, double y) {
            type = 'f';
            heading1X = x;
            heading2Y = y;
        }

        /// Piece-wise
        public InterpDescr(Piece[] pieceList) {
            type = 'p';
            pieces = pieceList;
        }
    }

    public static class PedroItems {

        Map<String, Double> values;
        Map<String, Pose> poses;
        Map<String, InterpDescr> interpolations;
        Map<String, Path> curves;
        Map<String, Path> paths;
        List<String> errors;

        PedroItems(NamedItems dto) {
            errors = new ArrayList<>();
            EvalValues(dto);
            EvalPoses(dto);
            EvalInterpolations(dto);
            EvalCurves(dto);
            EvalPaths(dto);
        }

        private static <T> void TransitiveAssignment(
            @NonNull Map<String, T> res,
            @NonNull Map<String, List<String>> pending,
            String name,
            T value
        ) {
            // Transitively set any pending value refs
            Stack<String> resolve = new Stack<>();
            resolve.push(name);
            do {
                name = resolve.pop();
                res.put(name, value);
                List<String> toAssign = pending.get(name);
                if (toAssign != null) {
                    for (String n : toAssign) {
                        resolve.push(n);
                    }
                    pending.remove(name);
                }
            } while (!resolve.empty());
        }

        Double getValue(@NonNull RValue<DTOValue> valRef) {
            if (valRef.isRef()) {
                return values.get(valRef.getRef());
            } else {
                return valRef.getItem().val;
            }
        }

        void EvalValues(@NonNull NamedItems dto) {
            values = new HashMap<>(dto.values.size());
            Map<String, List<String>> pending = new HashMap<>(dto.values.size());
            for (Map.Entry<String, RValue<DTOValue>> rval : dto.values.entrySet()) {
                String name = rval.getKey();
                RValue<DTOValue> valRef = rval.getValue();
                Double evaluated = getValue(valRef);
                if (evaluated != null) {
                    // We've got the full value.
                    // Take care of it, and any transitive definitions.
                    TransitiveAssignment(values, pending, name, evaluated);
                } else {
                    // We haven't seen this value yet:
                    // Add the name to the pending list for the ref, and keep going
                    pending.computeIfAbsent(valRef.getRef(), k -> new ArrayList<>()).add(name);
                }
            }
            if (!pending.isEmpty()) {
                // TODO: Fill this in with more/better details
                errors.add("Errors evaluating values");
            }
        }

        Double getHeading(RValue<DTOHeading> heading) {
            if (heading == null) {
                return null;
            }
            if (heading.isRef()) {
                // It's a poseref;
                RValue<DTOPose> poseRef = new RValue<>();
                poseRef.ref = heading.getRef();
                Pose p = getPose(poseRef);
                if (p == null) {
                    return null;
                }
                return p.heading();
            }
            DTOHeading h = heading.getItem();
            Double val = getValue(h.angle);
            if (val != null) {
                return h.inRadians ? val : (val * Math.PI) / 180.0;
            }
            return null;
        }

        Pose getPose(@NonNull RValue<DTOPose> poseRef) {
            if (poseRef.isRef()) {
                return poses.get(poseRef.getRef());
            } else {
                DTOPose dtoPose = poseRef.getItem();
                Double X = getValue(dtoPose.X);
                Double Y = getValue(dtoPose.Y);
                Double Heading = getHeading(dtoPose.heading);
                if (Heading == null) {
                    return X != null && Y != null ? new Pose(X, Y) : null;
                } else {
                    return X != null && Y != null ? new Pose(X, Y, Heading) : null;
                }
            }
        }

        void EvalPoses(@NonNull NamedItems dto) {
            poses = new HashMap<>(dto.poses.size());
            Map<String, List<String>> pending = new HashMap<>(dto.poses.size());
            for (Map.Entry<String, RValue<DTOPose>> rval : dto.poses.entrySet()) {
                String name = rval.getKey();
                RValue<DTOPose> poseRef = rval.getValue();
                Pose evaluated = getPose(poseRef);
                if (evaluated != null) {
                    // We've got the full value.
                    // Take care of it, and any transitive definitions.
                    TransitiveAssignment(poses, pending, name, evaluated);
                } else {
                    // We haven't seen this value yet:
                    // Add the name to the pending list for the ref, and keep going
                    pending.computeIfAbsent(poseRef.getRef(), k -> new ArrayList<>()).add(name);
                }
            }
            if (!pending.isEmpty()) {
                // TODO: Fill this in with more/better details
                errors.add("Errors evaluating poses");
            }
        }

        InterpDescr getInterpolator(@NonNull RValue<DTOInterpolator> interpRef) {
            if (interpRef.isRef()) {
                return interpolations.get(interpRef.getRef());
            } else {
                DTOInterpolator value = interpRef.getItem();
                if (value instanceof DTOTangent) {
                    return new InterpDescr(((DTOTangent) value).reversed);
                } else if (value instanceof DTOLinear) {
                    DTOLinear dto = (DTOLinear) value;
                    Double startHeading = getHeading(dto.startHeading);
                    Double endHeading = getHeading(dto.endHeading);
                    if (startHeading != null && endHeading != null) {
                        return new InterpDescr(startHeading, endHeading, dto.longWay);
                    } else {
                        return null;
                    }
                } else if (value instanceof DTOConstant) {
                    DTOConstant dto = (DTOConstant) value;
                    Double heading = getHeading(dto.heading);
                    return heading == null ? null : new InterpDescr(heading);
                } else if (value instanceof DTOFacingPoint) {
                    DTOFacingPoint dto = (DTOFacingPoint) value;
                    Pose pose = getPose(dto.point);
                    return pose == null ? null : new InterpDescr(pose.x(), pose.y());
                } else if (value instanceof DTOPieceWise) {
                    DTOPieceWise dto = (DTOPieceWise) value;
                    InterpDescr.Piece[] lst = new InterpDescr.Piece[dto.pieces.size()];
                    int i = 0;
                    for (DTOPiecePortion p : dto.pieces) {
                        Double until = getValue(p.until);
                        InterpDescr id = getInterpolator(p.interpolator);
                        if (until == null || id == null) {
                            return null;
                        }
                        lst[i++] = new InterpDescr.Piece(until, id);
                    }
                    return new InterpDescr(lst);
                }
            }
            return null;
        }

        void EvalInterpolations(@NonNull NamedItems dto) {
            interpolations = new HashMap<>(dto.interpolations.size());
            Map<String, List<String>> pending = new HashMap<>(dto.interpolations.size());
            for (Map.Entry<String, RValue<DTOInterpolator>> rval : dto.interpolations.entrySet()) {
                String name = rval.getKey();
                RValue<DTOInterpolator> interpRef = rval.getValue();
                InterpDescr evaluated = getInterpolator(interpRef);
                if (evaluated != null) {
                    // We've got the full value.
                    // Take care of it, and any transitive definitions.
                    TransitiveAssignment(interpolations, pending, name, evaluated);
                } else {
                    // We haven't seen this value yet:
                    // Add the name to the pending list for the ref, and keep going
                    pending.computeIfAbsent(interpRef.ref, k -> new ArrayList<>()).add(name);
                }
            }
            if (!pending.isEmpty()) {
                errors.add(sfmt("Errors evaluating interpolators: %d", pending.size()));
                for (Map.Entry<String, List<String>> item : pending.entrySet()) {
                    StringBuilder sb = new StringBuilder();
                    sb.append(item.getKey());
                    sb.append(':');
                    for (String dep : item.getValue()) {
                        sb.append(dep);
                        sb.append(',');
                    }
                    sb.append('\n');
                    errors.add(sb.toString());
                }
            }
        }

        void EvalCurves(@NonNull NamedItems dto) {
            curves = new HashMap<>(dto.curves.size());
            Map<String, List<String>> pending = new HashMap<>(dto.curves.size());
            for (Map.Entry<String, RValue<DTOCurve>> rval : dto.curves.entrySet()) {
                String name = rval.getKey();
                RValue<DTOCurve> curveRef = rval.getValue();
                Path evaluated = getCurve(curveRef);
                if (evaluated != null) {
                    // We've got the full value.
                    // Take care of it, and any transitive definitions.
                    TransitiveAssignment(curves, pending, name, evaluated);
                } else {
                    // We haven't seen this value yet:
                    // Add the name to the pending list for the ref, and keep going
                    pending.computeIfAbsent(curveRef.ref, k -> new ArrayList<>()).add(name);
                }
            }
            if (!pending.isEmpty()) {
                // TODO: Fill this in with more/better details
                errors.add("Errors evaluating curves");
            }
        }

        Interpolator getInterpForDescr(InterpDescr pi) {
            switch (pi.type) {
                case 't':
                    return pi.revOrLongWay ? Interpolator.tangent.reverse() : Interpolator.tangent;
                case 'c':
                    return Interpolator.constant(pi.heading1X);
                case 'l':
                    return pi.revOrLongWay
                        ? Interpolator.longLinear(pi.heading1X, pi.heading2Y)
                        : Interpolator.linear(pi.heading1X, pi.heading2Y);
                case 'f':
                    return Interpolator.facingPoint(new Pose(pi.heading1X, pi.heading2Y));
                case 'p': {
                    PiecewiseInterpolator i = Interpolator.piecewise();
                    for (InterpDescr.Piece piece : pi.pieces) {
                        i = i.until(piece.until, getInterpForDescr(piece.interp));
                    }
                    return i;
                }
                default:
                    return Interpolator.tangent;
            }
        }

        Path applyInterpolator(Path p, RValue<DTOInterpolator> dtoInterp, String failMessage) {
            InterpDescr id = getInterpolator(dtoInterp);
            if (id == null) {
                errors.add(failMessage);
                return null;
            }
            return p.heading(getInterpForDescr(id));
        }

        Path getCurve(@NonNull RValue<DTOCurve> curveRef) {
            if (curveRef.isRef()) {
                return curves.get(curveRef.getRef());
            } else {
                DTOCurve dtoCurve = curveRef.getItem();
                Pose[] poses = new Pose[dtoCurve.points.size()];
                int i = 0;
                for (RValue<DTOPose> pose : dtoCurve.points) {
                    Pose p = getPose(pose);
                    if (p == null) {
                        return null;
                    }
                    poses[i++] = p;
                }
                Path p;
                if (poses.length == 2) {
                    p = Paths.line(poses[0], poses[1]);
                } else {
                    p = Paths.curve(poses);
                }
                if (dtoCurve.interpolation == null) {
                    return p;
                }
                return applyInterpolator(
                    p,
                    dtoCurve.interpolation,
                    "Failed to evaluation interpolator for curve"
                );
            }
        }

        void EvalPaths(@NonNull NamedItems dto) {
            paths = new HashMap<>(dto.paths.size());
            for (Map.Entry<String, DTOPath> val : dto.paths.entrySet()) {
                String name = val.getKey();
                Path p = getPath(val.getValue());
                paths.put(name, p);
            }
        }

        Path getPath(@NonNull DTOPath p) {
            Path paths[] = new Path[p.curves.size()];
            int i = 0;
            for (RValue<DTOCurve> curveRef : p.curves) {
                Path c = getCurve(curveRef);
                if (c == null) {
                    errors.add("Unable to evaluate curve for path");
                    return null;
                }
                paths[i++] = c;
            }
            Path res = Paths.path(paths);

            if (p.globalInterpolator != null) {
                return applyInterpolator(
                    res,
                    p.globalInterpolator,
                    "Error evaluation global interpolator for path"
                );
            }
            return res;
        }
    }

    @JsonAdapter(RValue.AdapterFactory.class)
    public static class RValue<T> {

        String ref;
        T value;

        public boolean isRef() {
            return ref != null && !ref.isEmpty();
        }

        public String getRef() {
            return ref;
        }

        public T getItem() {
            return value;
        }

        // 1. The Factory that catches generic RValue<T> instances
        public static class AdapterFactory implements TypeAdapterFactory {

            @Override
            public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> type) {
                // Check if the type being parsed/written is assignable from RValue
                if (!RValue.class.isAssignableFrom(type.getRawType())) {
                    return null;
                }

                // Extract the inner type argument T (e.g., PoseDTO from RValue<PoseDTO>)
                Type societalType = type.getType();
                Type innerType = Object.class;
                if (societalType instanceof ParameterizedType) {
                    innerType = ((ParameterizedType) societalType).getActualTypeArguments()[0];
                }

                // Get Gson's built-in adapter for the inner type
                TypeAdapter<?> innerAdapter = gson.getAdapter(TypeToken.get(innerType));

                // Return our custom RValue adapter bound to this specific inner type
                return (TypeAdapter<T>) new RValueAdapter<>(innerAdapter);
            }
        }

        // 2. The actual Adapter that handles serialization and deserialization
        private static class RValueAdapter<T> extends TypeAdapter<RValue<T>> {

            private final TypeAdapter<T> innerAdapter;

            public RValueAdapter(TypeAdapter<T> innerAdapter) {
                this.innerAdapter = innerAdapter;
            }

            @Override
            public void write(JsonWriter out, RValue<T> value) throws IOException {
                throw new IOException("Unsupported");
            }

            @Override
            public RValue<T> read(JsonReader in) throws IOException {
                // Parse incoming JSON into a tree structure for easy inspection
                JsonParser jp = new JsonParser();
                JsonElement element = jp.parse(in);
                RValue<T> rVal = new RValue<>();

                if (element.isJsonObject() && element.getAsJsonObject().has("ref")) {
                    rVal.ref = element.getAsJsonObject().get("ref").getAsString();
                } else {
                    // Delegate reading the inline value back to the inner adapter
                    rVal.value = innerAdapter.fromJsonTree(element);
                }

                return rVal;
            }
        }
    }

    public static class DTOValue {

        public double val;
    }

    // A Line is 2 points
    public static class DTOCurve {

        public List<RValue<DTOPose>> points;
        public RValue<DTOInterpolator> interpolation; // nul    lable
    }

    public static class DTOPath {

        public List<RValue<DTOCurve>> curves;
        public RValue<DTOInterpolator> globalInterpolator; // nullable
    }

    public static class DTOHeading {

        public RValue<DTOValue> angle;
        public boolean inRadians;
    }

    public static class DTOPose {

        public RValue<DTOValue> X;
        public RValue<DTOValue> Y;
        public RValue<DTOHeading> heading; // Nullable
    }

    // Heading Interpolators:

    public static class DTOTangent extends DTOInterpolator {

        public boolean reversed = false;
    }

    public static class DTOConstant extends DTOInterpolator {

        public RValue<DTOHeading> heading;
    }

    public static class DTOFacingPoint extends DTOInterpolator {

        public RValue<DTOPose> point;
    }

    public static class DTOLinear extends DTOInterpolator {

        public RValue<DTOHeading> startHeading;
        public RValue<DTOHeading> endHeading;
        public boolean longWay = false;
    }

    public static class DTOPiecePortion {

        public RValue<DTOValue> until;
        public RValue<DTOInterpolator> interpolator;
    }

    public static class DTOPieceWise extends DTOInterpolator {

        public List<DTOPiecePortion> pieces;
    }

    @JsonAdapter(DTOInterpolator.AdapterFactory.class)
    public abstract static class DTOInterpolator {

        static class AdapterFactory implements TypeAdapterFactory {

            @Override
            public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> type) {
                if (!DTOInterpolator.class.isAssignableFrom(type.getRawType())) {
                    return null;
                }
                return (TypeAdapter<T>) new Adapter(gson);
            }
        }

        private static class Adapter extends TypeAdapter<DTOInterpolator> {

            private final Gson gson;

            public Adapter(Gson gson) {
                this.gson = gson;
            }

            @Override
            public void write(JsonWriter out, DTOInterpolator value) throws IOException {
                throw new IOException("Unsupported");
            }

            @Override
            public DTOInterpolator read(JsonReader in) throws IOException {
                // 1. Parse the incoming stream into a JsonObject tree
                JsonParser jp = new JsonParser();
                JsonObject jsonObject = jp.parse(in).getAsJsonObject();

                Class<? extends DTOInterpolator> targetClass;
                if (jsonObject.has("reversed")) {
                    targetClass = DTOTangent.class;
                } else if (jsonObject.has("point")) {
                    targetClass = DTOFacingPoint.class;
                } else if (jsonObject.has("heading")) {
                    targetClass = DTOConstant.class;
                } else if (jsonObject.has("start")) {
                    targetClass = DTOLinear.class;
                } else if (jsonObject.has("pieces")) {
                    targetClass = DTOPieceWise.class;
                } else {
                    String err =
                        "Unrecognized child type for DTOInterpolator: " + jsonObject.toString();
                    throw new JsonParseException(err);
                }
                // Delegate the object mapping back to Gson for the specific subclass
                return gson.fromJson(jsonObject, targetClass);
            }
        }
    }
}
