# Generation log

| Stage | Variant | Model | Job ID | Credits |
|---|---|---|---|---|
| Master | V1 | gpt_image_2_5 high 2K 9:16 | c0862d9e-c515-4038-acdc-a50835744977 | 2.75 |
| Master | V2 (recommended) | gpt_image_2_5 high 2K 9:16 | ddfef256-af05-4a13-b1a9-4819ac41dd9b | 2.75 |
| Master | V3 | gpt_image_2_5 high 2K 9:16 | 686ff3b9-aa12-4171-91da-b3cc274f64af | 2.75 |
| Master | V4 | gpt_image_2_5 high 2K 9:16 | 682e625d-9f39-451d-b1c7-923ec7bdc327 | 2.75 |

Balance after master stage: 1,188.75 credits (11 spent).

Outputs are 1520×2688 PNG on the Higgsfield CDN (d8j0ntlcm91z4.cloudfront.net), which this
cloud environment's network policy currently blocks; review and editing run in the Higgsfield sandbox.

## Keyframes (gpt_image_2_5 high 2K 9:16, 2.75 cr each) — ✅ = selected

| Key | State | Variant A | Variant B |
|---|---|---|---|
| K0 | Master (pristine front) | ✅ ddfef256-af05-4a13-b1a9-4819ac41dd9b (master V2) | |
| K1 | Worn front, narrow light | bcfb2cf7-8500-4e81-874a-b8e789f72528 | ✅ 1ee0f681-1d08-49c2-a5b1-b28f93037adb |
| K2 | Worn screen, macro | a10a314f-1f7c-4be5-bba3-b04ba4a3744f | ✅ 88d65d73-fe9c-4541-b665-fe728c9fd8fd |
| K3 | Pristine + screen protector, macro | ✅ 12c5ae19-2bff-48da-b81b-4ccd92839648 | f7bda1ae-720b-4430-9ec4-e208158ff4a4 |
| K4 | Rear, bare 3-lens module | ✅ caa21044-646d-4dde-b948-3fd199aec185 | 8a4ccb4c-9fff-4524-b0f3-ca8096bd1743 |
| K5 | Rear + lens protector | ✅ b3bb0abb-848b-472b-9f8f-32fe30698073 | 1421f0b5-5908-47c3-850b-56bcfc594453 |
| K6 | Front + empty clear case behind | ✅ 041ae298-2c33-4618-97cc-5ed7f9accff2 | 7f3fb8f9-e2d7-49dc-984d-3832a3540552 |
| K7 | Front, fitted in clear case (also final hero) | 2d00e445-8af0-41e4-b677-bac560d4da96 | ✅ 0e65a039-da8d-4376-844b-ff4e75eea60b |
| K8 | Rear, in clear case + lens protector | ✅ 1e714c8e-3d93-4519-a18b-762e176b35b8 | 0de43e1b-89ec-4471-bcb5-6e7427071f0f |

Stills spend: 55 credits (master 11 + keyframes 44).

## Video takes (kling4_0, image-to-video, 1080p 9:16, ~1 cr/s)

| Shot | Frames | Dur | Take 1 job |
|---|---|---|---|
| S1 Old phone → macro push-in | K1 → K2 | 4 s | 8010911b-e6b1-4396-bf4b-a16835957eac |
| S2 Screen protector | K2 → K3 | 5 s | 31a30144-9ef0-443d-85f1-cd80a07ce508 |
| S3 Lens protector | K4 → K5 | 4 s | d5725fcb-8826-4049-bb44-a67895d28a18 |
| S4 Clear case | K6 → K7 | 5 s | 573d71dd-c331-425b-a8d1-1e29d5357cda |
| S5+6 Hero orbit | K8 → K7 | 6 s | b70f9975-cd5e-4452-b126-07bbb6d391e7 |

### Review of take 1 (all 1080×1912, 24 fps)
- S1 ✅ push-in + light sweep, scratches clear.
- S2 ❌ protector changes size mid-flight and a second plate appears — rejected (wrong product geometry). Re-take submitted.
- S3 ✅ lens protector cut-outs align with 3 lenses + flash; trim before the pull-back (~2.4 s).
- S4 ✅ clean case fit + edge light.
- S5 ✅ clean half-turn rear → front.

| Shot | Take | Job |
|---|---|---|
| S2 | 2 | c8b22372-acb4-45df-add9-39447a3ea588 |
| S2 | 3 | 3ccb88ef-95d2-4e68-a46c-f5fa3aab9e04 |

## Voice-over (elevenlabs_v4, ~0.7 cr each)
| Voice | Job |
|---|---|
| Arthur (British, soft-spoken) | 8276ab97-fd3f-4af7-aba0-930b4ef15753 |
| Imogen (British, bold) | 04029c22-30fd-4ac3-9d90-7a9239b124b7 |

## Selections for the edit
- S2: **take 2** (c8b22372…). The faint second ring/outline while the glass hovers is its reflection in the glossy
  screen (offset shrinks to zero as it seats), not extra geometry. Take 3 kept as backup.
- VO: **Arthur** (soft-spoken British, closest to "premium and understated"). Imogen take kept as an alternate;
  swapping is one re-run of `audio.py` + `build.py`.
- Frame rate: 60 fps via motion-compensated interpolation (FFmpeg minterpolate, mci/aobmc). Inspected
  synthesised frames on the fastest S5 rotation: no ghosting, lens count stable.
