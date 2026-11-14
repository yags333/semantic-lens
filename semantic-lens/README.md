# SemanticLens (LocalMedia AI) 🔍📱

**SemanticLens** is a cross-platform mobile application (React Native / TypeScript) enabling natural language semantic search across all local images and media files stored on a smartphone (Android / iOS). 

All inference, tokenization, vector math, and indexing are executed **100% offline and on-device**, guaranteeing complete user privacy.

---

## 1. Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   React Native UI                      │
│   SearchScreen • ImageDetailScreen • GalleryScreen    │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       [Query: "warrior"]        [Local Photo Files]
                │                        │
                ▼                        ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     CLIP BPE Tokenizer    │  │  Image Preprocessor     │
│   77 tokens (<SOT>, <EOT>)│  │  224x224 RGB, ImageNet   │
└───────────────┬───────────┘  └─────────┬───────────────┘
                │                        │
                ▼                        ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│  ONNX Text Encoder        │  │  ONNX Vision Encoder    │
│  (MobileCLIP / CLIP ViT)  │  │  (MobileCLIP / CLIP ViT)│
│  -> 512-dim Float32       │  │  -> 512-dim Float32     │
└───────────────┬───────────┘  └─────────┬───────────────┘
                │                        │
                ▼                        ▼
┌────────────────────────────────────────────────────────┐
│             Local SQLite Vector Store                  │
│   Float32Array BLOBs • Sub-millisecond Dot-Product     │
│   Cosine Similarity • File Extension & Date Filters    │
└────────────────────────────────────────────────────────┘
```

- **Frontend**: React Native with TypeScript and Expo/Bare workflow. Optimized virtualized image grid, instant debounced query filtering, and interactive EXIF viewer.
- **Local Database**: SQLite (`expo-sqlite` / `react-native-quick-sqlite`) storing metadata, capture timestamps, file extensions, and pre-calculated 512-dimensional Float32 vector embeddings serialized as binary IEEE 754 BLOBs (2,048 bytes per photo).
- **On-Device AI Engine**: ONNX Runtime Mobile (`onnxruntime-react-native`) executing MobileCLIP or quantized CLIP (ViT-B/32 Int8) locally on the mobile CPU/NPU/GPU. Includes a deterministic vector engine for emulators.
- **Battery-Aware Background Worker**: Throttled batch indexing (10-25 images per chunk, 80ms thermal pause) that automatically suspends if battery falls below 15%.

---

## 2. Directory Structure

```
semantic-lens/
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript compiler configuration
├── app.json                   # Expo & mobile app manifest (permissions, bundle IDs)
├── metro.config.js            # Metro bundler configured for .onnx & .tflite assets
├── test_vector_search.js      # Automated unit test suite (vector math & ranking)
├── index.html                 # Interactive standalone smartphone emulator preview
├── assets/
│   ├── models/                # ONNX model binaries (text & vision encoders)
│   └── sample_images/         # Local test media assets
├── src/
│   ├── types/
│   │   ├── media.ts           # MediaItem, ExifMetadata, SupportedExtension
│   │   ├── vector.ts          # SimilarityMatch, VectorSearchResult, VectorStoreStats
│   │   ├── search.ts          # FilterOptions, IndexingStatus, SortOrder
│   │   └── navigation.ts      # Navigation stack types
│   ├── ai/
│   │   ├── vectorMath.ts      # Cosine similarity, L2 norm, IEEE 754 BLOB converters
│   │   ├── tokenizer.ts       # CLIP BPE Tokenizer (77-token context length)
│   │   ├── imagePreprocessor.ts # 224x224 RGB resizing & ImageNet normalization
│   │   ├── onnxModelRunner.ts # ONNX Runtime Mobile inference wrapper
│   │   ├── mockClipEngine.ts  # Deterministic 512-dim semantic vector engine
│   │   └── aiEngine.ts        # Unified AI facade (switches ONNX / Emulator)
│   ├── db/
│   │   ├── database.ts        # SQLite table schema, migrations, CRUD
│   │   ├── vectorStore.ts     # Fast cosine similarity search & metadata filtering
│   │   └── queries.ts         # Query helpers & queue management
│   ├── services/
│   │   ├── permissionService.ts # Android 13+ READ_MEDIA_IMAGES & iOS PHPhotoLibrary
│   │   ├── mediaScannerService.ts # Local gallery scanner & unindexed diff detection
│   │   └── indexingQueue.ts   # Battery-aware background batch vectorizer
│   ├── components/
│   │   ├── SearchBar.tsx      # Debounced search bar with suggestion chips
│   │   ├── ImageGrid.tsx      # Virtualized responsive image grid with match badges
│   │   ├── FilterModal.tsx    # Extension (.jpg, .png, etc.) & date range modal
│   │   ├── MetadataBadge.tsx  # EXIF tags (ISO, Shutter, Aperture, Camera, Size)
│   │   └── SimilarPhotosList.tsx # Reverse visual similarity horizontal carousel
│   ├── screens/
│   │   ├── SearchScreen.tsx   # Natural language search screen
│   │   ├── ImageDetailScreen.tsx # Full-res viewer, EXIF data, visually similar photos
│   │   ├── GalleryScreen.tsx  # Local media browser with filter badges
│   │   └── IndexingStatusScreen.tsx # Storage permissions & indexing queue dashboard
│   ├── data/
│   │   └── seedMedia.ts       # 10 photorealistic test images with 512-dim embeddings
│   └── App.tsx                # App entry with bottom navigation tabs
```

---

## 3. Core Modules & Pipeline Details

### 3.1 Storage & Permission Management
- **Android 13+ (API 33+)**: Uses `android.permission.READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO`.
- **Legacy Android (API ≤ 32)**: Automatically falls back to `android.permission.READ_EXTERNAL_STORAGE`.
- **iOS**: Uses `PHPhotoLibrary` with comprehensive permission handling (`authorized`, `limited`, `denied`).
- **Privacy Policy**: No internet permission (`INTERNET`) is required or declared in the manifest. All image embeddings and searches remain on the physical device.

### 3.2 On-Device AI Embedding Pipeline
- **Input Text Query**: Tokenized via CLIP Byte-Pair Encoding (`<|startoftext|>`, token IDs, `<|endoftext|>`, padded with zeros to length 77).
- **Text Embedding**: Passed through the ONNX text encoder to yield a 512-dimensional vector.
- **Normalization**: Vectors are normalized to unit Euclidean length ($\|\mathbf{v}\|_2 = 1.0$).
- **Cosine Similarity**: Since vectors are unit-normalized, the cosine similarity between query vector $\mathbf{q}$ and stored photo embedding $\mathbf{d}$ simplifies to an ultra-fast dot product:
  $$\text{CosineSimilarity}(\mathbf{q}, \mathbf{d}) = \sum_{i=1}^{512} q_i \cdot d_i$$

### 3.3 Reverse Image Search ("Find Visually Similar")
When viewing any photo in `ImageDetailScreen`, tapping or scrolling to the "Visually Similar Photos" section takes the selected photo's precomputed 512-dimensional embedding and evaluates cosine similarity against all other images in SQLite, surfacing visually and semantically related photos instantaneously.

---

## 4. Verification & Testing

### 4.1 Running the Automated Vector Test Suite
A self-contained test suite tests vector normalization, L2 norm, query tokenization, cosine similarity ranking, extension filtering, and reverse visual similarity:

```bash
# On macOS (uses built-in JavaScriptCore):
/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc test_vector_search.js

# Or using Node.js:
node test_vector_search.js
```

**Test Output:**
```
====================================================
  SemanticLens (LocalMedia AI) - Vector Test Suite  
====================================================

1. Testing Vector Math & Normalization...
  [PASS] L2 Norm of [3, 4] is 5.0
  [PASS] Normalized vector has unit length 1.0

2. Testing Natural Language Semantic Search Ranking...
  [PASS] Query "a warrior with a sword" -> Top: ancient_warrior_blade.jpg (100.0% match)
  [PASS] Query "dog running on grass" -> Top: golden_retriever_grass.png (85.0% match)
  [PASS] Query "sunset over mountains" -> Top: alpine_sunset_mountains.heic (86.5% match)
  [PASS] Query "birthday cake with candles" -> Top: chocolate_birthday_cake.jpg (100.0% match)
  [PASS] Query "red sports car" -> Top: red_sports_supercar.webp (100.0% match)

3. Testing Metadata & Extension Filtering...
  [PASS] File extension filter (.jpg) returns 2 items
  [PASS] Date filter (past 7 days) returns 3 items

4. Testing Visual Similarity Reverse Search...
  [PASS] Reverse image search scored all candidates
   Candidate closest to warrior: golden_retriever_grass.png

====================================================
  Results: 10 / 10 tests passed (100%)
====================================================
```

### 4.2 Interactive Emulator Web Preview
An interactive smartphone emulator is included in `index.html`. You can preview it immediately in any browser:

```bash
# Using Python:
python3 -m http.server 8080

# Or using Ruby:
ruby -run -e httpd . -p 8080
```
Open `http://localhost:8080` to interact with live semantic search, suggestion pills, image detail views, and filter modals.

---

## 5. Compiling & Running on Android and iOS Emulators

### Prerequisites
1. **Node.js**: v18.0 or higher.
2. **Android Studio**: Android SDK (API 33+) and an Android Virtual Device (AVD).
3. **Xcode** (macOS only): For iOS Simulator.
4. **Expo CLI** (optional, recommended): `npm install -g expo-cli`.

### Step 1: Install Dependencies
```bash
cd /Users/yagneshsuthar/.gemini/antigravity/scratch/semantic-lens
npm install
```

### Step 2: Running on Android Emulator
1. Launch your Android Virtual Device (AVD) from Android Studio.
2. Compile and launch the app:
   ```bash
   npm run android
   # or
   npx expo run:android
   ```
3. Grant photo access when prompted:
   - On Android 13+, the app requests `READ_MEDIA_IMAGES`.
   - On earlier Android versions, it requests `READ_EXTERNAL_STORAGE`.

### Step 3: Running on iOS Simulator
1. Start an iOS Simulator (e.g., iPhone 15 Pro):
   ```bash
   open -a Simulator
   ```
2. Compile and launch the app:
   ```bash
   npm run ios
   # or
   npx expo run:ios
   ```
3. Select "Allow Access to All Photos" when iOS displays the photo permission dialog.

---

## 6. Exporting Custom MobileCLIP / CLIP ONNX Models

To use quantized custom ONNX models on-device:

1. **Export MobileCLIP using PyTorch & ONNX**:
   ```python
   import torch
   import mobileclip

   model, _, preprocess = mobileclip.create_model_and_transforms('mobileclip_s0', pretrained='datacompdr')
   model.eval()

   # Export Text Encoder
   dummy_tokens = torch.zeros(1, 77, dtype=torch.int32)
   torch.onnx.export(
       model.text_encoder,
       dummy_tokens,
       "assets/models/mobileclip_text.onnx",
       input_names=["input_ids"],
       output_names=["text_embeds"],
       dynamic_axes={"input_ids": {0: "batch_size"}}
   )

   # Export Vision Encoder
   dummy_pixels = torch.randn(1, 3, 224, 224)
   torch.onnx.export(
       model.image_encoder,
       dummy_pixels,
       "assets/models/mobileclip_vision.onnx",
       input_names=["pixel_values"],
       output_names=["image_embeds"],
       dynamic_axes={"pixel_values": {0: "batch_size"}}
   )
   ```

2. **Quantize with ONNX Runtime to 8-bit Integer (Int8)**:
   ```python
   from onnxruntime.quantization import quantize_dynamic, QuantType

   quantize_dynamic(
       "assets/models/mobileclip_text.onnx",
       "assets/models/mobileclip_text_int8.onnx",
       weight_type=QuantType.QInt8
   )
   quantize_dynamic(
       "assets/models/mobileclip_vision.onnx",
       "assets/models/mobileclip_vision_int8.onnx",
       weight_type=QuantType.QInt8
   )
   ```
   Quantization reduces the vision encoder size to ~25MB and text encoder to ~15MB, delivering fast inference on mobile hardware.

---

## 7. Privacy & Security Guarantees
- 🔒 **Zero Telemetry & Zero Cloud Transmission**: No analytics or remote network calls.
- ⚡ **Local SQLite Storage**: EXIF data and Float32 embeddings are stored in app-private sandboxed SQLite storage.
- 🔋 **Battery-Safe**: Indexing runs in micro-batches with thermal cool-downs and pauses when battery is low.
