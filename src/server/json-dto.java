package org.freik_gson;

import com.google.gson.*;
import com.google.gson.annotations.JsonAdapter;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

public class Main {

    //  public NamedItems loadPathFromJson(Context context, String fileName) {
    //      try (Reader reader = new InputStreamReader(context.getAssets().open(fileName))) {
    public static NamedItems loadPathFromJson(String fileName) {
        try (Reader reader = new InputStreamReader(Files.newInputStream(Paths.get(fileName)))) {
            Gson gson = new Gson();
            return gson.fromJson(reader, NamedItems.class);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static void main(String[] args) {
        /*
        DTOValue dtoValue = new DTOValue(Math.PI);
        DTOValue dtoValue2 = new DTOValue(Math.E);
        DTOValue zero = new DTOValue(0.0);
        DTOPose dtoPose = new DTOPose(dtoValue, dtoValue2, zero, true);
        DTOPose dtoOther = new DTOPose("v1", "v2", "v3", true);
        List<RValue<DTOPose>> points = new ArrayList<>();
        points.add(new RValue<>(dtoPose));
        points.add(new RValue<DTOPose>("pose"));
        points.add(new RValue<>(dtoOther));
        FacingPoint facingPoint = new FacingPoint("facing");
        RValue<Interpolator> interpolation = new RValue<Interpolator>("pose");
        RValue<Interpolator> interpolation2 = new RValue<Interpolator>(facingPoint);
        DTOCurve dtoCurve = new DTOCurve(points, interpolation);
        dtoCurve.interpolation = interpolation;
        DTOPath dtoPath = new DTOPath();
        dtoPath.curves = new ArrayList<>();
        dtoPath.curves.add(new RValue<>(dtoCurve));
        dtoPath.globalInterpolator = interpolation;
        NamedItems items = new NamedItems();
        items.values = new HashMap<>();
        items.values.put("v1", dtoValue);
        items.values.put("v2", dtoValue2);
        items.values.put("v3", zero);
        items.poses = new HashMap<>();
        items.poses.put("pose", dtoPose);
        items.poses.put("otherPose", dtoOther);
        items.curves = new HashMap<>();
        items.curves.put("curve", dtoCurve);
        items.interpolations = new HashMap<>();
        items.interpolations.put("facing", facingPoint);
        items.paths = new HashMap<>();
        items.paths.put("aPath", dtoPath);
        */
        Gson gson = new Gson();
        String vals = """
         {
           "values": {
             "v1": { "val": 3.141592653589793 },
             "v2": { "val": 2.718281828459045 },
             "v3": { "val": 0.0 }
           },
           "poses": {
             "otherPose": {
               "X": { "ref": "v1" },
               "Y": { "ref": "v2" },
               "Heading": { "ref": "v3" },
               "inRadians": true
             },
             "pose": {
               "X": { "val": 3.141592653589793 },
               "Y": { "val": 2.718281828459045 },
               "Heading": { "val": 0.0 },
               "inRadians": true
             }
           },
           "curves": {
             "curve": {
               "points": [
                 {
                   "X": { "val": 3.141592653589793 },
                   "Y": { "val": 2.718281828459045 },
                   "Heading": { "val": 0.0 },
                   "inRadians": true
                 },
                 { "ref": "pose" },
                 {
                   "X": { "ref": "v1" },
                   "Y": { "ref": "v2" },
                   "Heading": { "ref": "v3" },
                   "inRadians": true
                 }
               ],
               "interpolation": { "ref": "pose" }
             }
           },
           "interpolations": {
             "facing": { "point": { "ref": "facing" }, "type": "FacingPoint" }
           },
           "paths": {
             "aPath": {
               "curves": [
                 {
                   "points": [
                     {
                       "X": { "val": 3.141592653589793 },
                       "Y": { "val": 2.718281828459045 },
                       "Heading": { "val": 0.0 },
                       "inRadians": true
                     },
                     { "ref": "pose" },
                     {
                       "X": { "ref": "v1" },
                       "Y": { "ref": "v2" },
                       "Heading": { "ref": "v3" },
                       "inRadians": true
                     }
                   ],
                   "interpolation": { "ref": "pose" }
                 }
               ],
               "globalInterpolator": { "ref": "pose" }
             }
           }
         }
        """;
        // gson.toJson(items);
        NamedItems roundTrip = gson.fromJson(vals, NamedItems.class);
        System.out.printf("%d%n", roundTrip.values.size());
        System.out.printf("%d%n", roundTrip.poses.size());
        System.out.printf("%d%n", roundTrip.curves.size());
        System.out.printf("%d%n", roundTrip.interpolations.size());
        System.out.printf("%d%n", roundTrip.paths.size());
    }

    public static class NamedItems {

        public Map<String, DTOValue> values;
        public Map<String, DTOPose> poses;
        public Map<String, DTOCurve> curves;
        public Map<String, Interpolator> interpolations;
        public Map<String, DTOPath> paths;
    }

    @JsonAdapter(RValue.AdapterFactory.class)
    public static class RValue<T> {

        private String ref;
        private T value;

        public boolean isRef() {
            return ref != null && !ref.isEmpty();
        }

        public String getRef() {
            return ref;
        }

        public T getValue() {
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
                if (value == null) {
                    out.nullValue();
                    return;
                }
                if (value.isRef()) {
                    out.beginObject();
                    out.name("ref").value(value.getRef());
                    out.endObject();
                } else {
                    // Delegate writing the inline value to its native adapter
                    innerAdapter.write(out, value.getValue());
                }
            }

            @Override
            public RValue<T> read(JsonReader in) throws IOException {
                // Parse incoming JSON into a tree structure for easy inspection
                JsonElement element = JsonParser.parseReader(in);
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
        public RValue<Interpolator> interpolation; // nullable
    }

    public static class DTOPath {

        public List<RValue<DTOCurve>> curves;
        public RValue<Interpolator> globalInterpolator; // nullable
    }

    public static class DTOPose {

        public RValue<DTOValue> X;
        public RValue<DTOValue> Y;
        public RValue<DTOValue> Heading; // Nullable
        public boolean inRadians;
    }

    // Heading Interpolators:

    public static class Constant extends Interpolator {

        @Override
        public String getType() {
            return "Constant";
        }

        public RValue<DTOValue> heading;
    }

    public static class FacingPoint extends Interpolator {

        @Override
        public String getType() {
            return "FacingPoint";
        }

        public RValue<DTOPose> point;
    }

    public static class Linear extends Interpolator {

        @Override
        public String getType() {
            return "Linear";
        }

        public RValue<DTOValue> startHeading;
        public RValue<DTOValue> endHeading;
        public boolean longWay = false;
    }

    public static class PiecePortion {

        public RValue<DTOValue> until;
        public RValue<Interpolator> interpolator;
    }

    public static class PieceWise extends Interpolator {

        @Override
        public String getType() {
            return "PieceWise";
        }

        public List<PiecePortion> pieces;
    }

    public static class Tangent extends Interpolator {

        public String getType() {
            return "Tangent";
        }

        public boolean reversed = false;
    }

    @JsonAdapter(Interpolator.AdapterFactory.class)
    public abstract static class Interpolator {

        public abstract String getType();

        static class AdapterFactory implements TypeAdapterFactory {

            @Override
            public <T> TypeAdapter<T> create(Gson gson, TypeToken<T> type) {
                if (!Interpolator.class.isAssignableFrom(type.getRawType())) {
                    return null;
                }

                // Delegate to runtime mapping or handle sub-typing logic here
                // This keeps your GsonBuilder completely clean of navigation rules.
                return (TypeAdapter<T>) new Adapter(gson);
            }
        }

        private static class Adapter extends TypeAdapter<Interpolator> {

            private final Gson gson;

            // Gson passes itself into the adapter factory, which we forward here
            public Adapter(Gson gson) {
                this.gson = gson;
            }

            @Override
            public void write(JsonWriter out, Interpolator value) throws IOException {
                if (value == null) {
                    out.nullValue();
                    return;
                }

                // 1. Let Gson convert the concrete class into a JsonElement tree
                JsonElement tree = gson.toJsonTree(value, value.getClass());
                JsonObject jsonObject = tree.getAsJsonObject();

                // 2. Inject the correct "type" discriminator based on the subclass
                if (value instanceof Tangent) {
                    jsonObject.addProperty("type", "Tangent");
                } else if (value instanceof Linear) {
                    jsonObject.addProperty("type", "Linear");
                } else if (value instanceof Constant) {
                    jsonObject.addProperty("type", "Constant");
                } else if (value instanceof FacingPoint) {
                    jsonObject.addProperty("type", "FacingPoint");
                } else if (value instanceof PieceWise) {
                    jsonObject.addProperty("type", "PieceWise");
                }

                // 3. Write the modified tree out to the stream
                gson.toJson(jsonObject, out);
            }

            @Override
            public Interpolator read(JsonReader in) throws IOException {
                // 1. Parse the incoming stream into a JsonObject tree
                JsonObject jsonObject = JsonParser.parseReader(in).getAsJsonObject();

                if (!jsonObject.has("type")) {
                    throw new JsonParseException(
                        "Missing 'type' discriminator field for Interpolator"
                    );
                }

                String type = jsonObject.get("type").getAsString();
                Class<? extends Interpolator> targetClass;

                // 2. Map the string type to the correct concrete Java class
                switch (type) {
                    case "Tangent":
                        targetClass = Tangent.class;
                        break;
                    case "Linear":
                        targetClass = Linear.class;
                        break;
                    case "Constant":
                        targetClass = Constant.class;
                        break;
                    case "FacingPoint":
                        targetClass = FacingPoint.class;
                        break;
                    case "PieceWise":
                        targetClass = PieceWise.class;
                        break;
                    default:
                        throw new JsonParseException("Unknown heading interpolation type: " + type);
                }

                // 3. Delegate the object mapping back to Gson for the specific subclass
                return gson.fromJson(jsonObject, targetClass);
            }
        }
    }
}
