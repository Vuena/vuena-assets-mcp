// Hand-written search metadata for the 76 CC0 models. key = file stem.
// [category, extra tags]. Style/pack tags are added by build-catalog.mjs.
export const META = {
  // Store Simulator Kit
  sk_pos_till: ['props', ['store', 'shop', 'checkout', 'cash register', 'till', 'pos', 'counter', 'retail', 'simulator']],
  sk_prod_can_soda_a: ['food', ['store', 'soda', 'can', 'drink', 'beverage', 'product', 'grocery', 'simulator']],
  sk_prod_cereal_l_a: ['food', ['store', 'cereal', 'box', 'breakfast', 'product', 'grocery', 'simulator']],
  sk_shelf_wall_120: ['furniture', ['store', 'shelf', 'shelving', 'wall', 'rack', 'retail', 'simulator']],
  sk_price_tag_shelf: ['signage', ['store', 'price tag', 'label', 'shelf', 'retail', 'simulator']],
  sk_carton_s: ['props', ['store', 'box', 'carton', 'cardboard', 'storage', 'crate', 'simulator']],
  // Gas Station Simulator Kit
  gs_bollard_steel: ['props', ['gas station', 'bollard', 'post', 'steel', 'barrier', 'street', 'simulator']],
  gs_pump_modern: ['props', ['gas station', 'fuel pump', 'petrol', 'pump', 'forecourt', 'car', 'simulator']],
  gs_prod_oil_5l_a: ['props', ['gas station', 'oil', 'motor oil', 'jug', 'bottle', 'garage', 'product', 'simulator']],
  gs_cone_traffic: ['props', ['gas station', 'traffic cone', 'cone', 'road', 'construction', 'street', 'simulator']],
  gs_jerry_can: ['props', ['gas station', 'jerry can', 'fuel', 'petrol', 'can', 'garage', 'simulator']],
  gs_tire: ['props', ['gas station', 'tire', 'tyre', 'wheel', 'rubber', 'garage', 'car', 'simulator']],
  // Modular Apartment Interior Kit
  ap_mug: ['props', ['apartment', 'mug', 'cup', 'coffee', 'tea', 'kitchen', 'interior', 'decor']],
  ap_pillow_square: ['furniture', ['apartment', 'cushion', 'pillow', 'sofa', 'living room', 'interior', 'decor']],
  ap_armchair: ['furniture', ['apartment', 'armchair', 'chair', 'seat', 'sofa', 'living room', 'interior']],
  ap_coffee_table: ['furniture', ['apartment', 'table', 'coffee table', 'wood', 'living room', 'interior']],
  ap_plant_small: ['props', ['apartment', 'plant', 'houseplant', 'pot', 'flower pot', 'nature', 'interior', 'decor']],
  ap_table_lamp: ['props', ['apartment', 'lamp', 'table lamp', 'light', 'lighting', 'interior', 'decor']],
  // Factory Simulator Kit
  fk_item_box: ['props', ['factory', 'box', 'product', 'package', 'conveyor', 'warehouse', 'simulator']],
  fk_sign_forklift: ['signage', ['factory', 'sign', 'warning', 'forklift', 'safety', 'warehouse', 'simulator']],
  fk_traffic_barrier_2m: ['props', ['factory', 'barrier', 'safety', 'road', 'fence', 'warehouse', 'simulator']],
  fk_barrel_steel: ['props', ['factory', 'barrel', 'drum', 'steel', 'oil drum', 'industrial', 'simulator']],
  fk_box_closed: ['props', ['factory', 'box', 'carton', 'taped', 'cardboard', 'storage', 'warehouse', 'simulator']],
  fk_pallet_wood: ['props', ['factory', 'pallet', 'wood', 'wooden', 'warehouse', 'storage', 'industrial', 'simulator']],
  // Rigged characters
  blocky_01_hero: ['characters', ['hero', 'adventurer', 'player', 'humanoid', 'person', 'rpg', 'blocky']],
  blocky_03_knight: ['characters', ['knight', 'armor', 'medieval', 'fantasy', 'warrior', 'humanoid', 'rpg', 'blocky']],
  blocky_05_wizard: ['characters', ['wizard', 'mage', 'magic', 'fantasy', 'witch', 'humanoid', 'rpg', 'blocky']],
  blocky_06_pirate: ['characters', ['pirate', 'sailor', 'captain', 'humanoid', 'adventure', 'blocky']],
  blocky_07_astronaut: ['characters', ['astronaut', 'space', 'spaceman', 'sci-fi', 'humanoid', 'blocky']],
  blocky_08_robot: ['characters', ['robot', 'android', 'mech', 'sci-fi', 'machine', 'blocky']],
  blocky_09_zombie: ['characters', ['zombie', 'undead', 'horror', 'enemy', 'humanoid', 'monster', 'blocky']],
  blocky_19_princess: ['characters', ['princess', 'queen', 'royal', 'fantasy', 'humanoid', 'blocky']],
  // Toy cars
  muscle_blue: ['vehicles', ['car', 'muscle car', 'sports car', 'toy', 'racing', 'blue', 'blocky']],
  monster_orange: ['vehicles', ['car', 'monster truck', 'truck', 'offroad', 'toy', 'orange', 'blocky']],
  police_classic: ['vehicles', ['car', 'police', 'cop', 'emergency', 'toy', 'sedan', 'blocky']],
  icecream_pink: ['vehicles', ['car', 'ice cream van', 'ice cream truck', 'van', 'toy', 'pink', 'blocky']],
  fire_red: ['vehicles', ['car', 'fire truck', 'fire engine', 'emergency', 'truck', 'toy', 'red', 'blocky']],
  // Pets
  animal_cat: ['animals', ['cat', 'kitten', 'pet', 'domestic', 'feline', 'cute', 'blocky']],
  animal_fox: ['animals', ['fox', 'wildlife', 'forest', 'wild', 'cute', 'blocky']],
  animal_owl: ['animals', ['owl', 'bird', 'wildlife', 'night', 'flying', 'cute', 'blocky']],
  // Monsters
  monster_01_pumpkinhead: ['creatures', ['pumpkin', 'halloween', 'monster', 'enemy', 'spooky', 'horror', 'blocky']],
  monster_03_ghost: ['creatures', ['ghost', 'halloween', 'monster', 'enemy', 'spooky', 'spirit', 'blocky']],
  monster_10_skeleton: ['creatures', ['skeleton', 'halloween', 'undead', 'monster', 'enemy', 'spooky', 'bones', 'blocky']],
  prop_02_pumpkin_medium: ['props', ['pumpkin', 'halloween', 'vegetable', 'autumn', 'spooky', 'decoration', 'blocky']],
  prop_04_jackolantern: ['props', ['jack-o-lantern', 'pumpkin', 'halloween', 'lantern', 'spooky', 'decoration', 'blocky']],
  prop_05_gravestone_round: ['props', ['gravestone', 'tombstone', 'grave', 'graveyard', 'cemetery', 'halloween', 'spooky', 'blocky']],
  prop_08_candle: ['props', ['candle', 'halloween', 'light', 'fire', 'spooky', 'decoration', 'blocky']],
  prop_20_skull: ['props', ['skull', 'bones', 'halloween', 'death', 'spooky', 'decoration', 'blocky']],
  // Winter
  prop_candy_cane: ['props', ['candy cane', 'christmas', 'winter', 'sweet', 'candy', 'holiday', 'decoration', 'blocky']],
  prop_igloo: ['buildings', ['igloo', 'ice house', 'winter', 'snow', 'arctic', 'shelter', 'building', 'blocky']],
  prop_lantern_post: ['props', ['lantern', 'lamp post', 'street lamp', 'light', 'christmas', 'winter', 'street', 'blocky']],
  prop_pine_snow_small: ['nature', ['tree', 'pine', 'fir', 'snow', 'snowy', 'winter', 'forest', 'evergreen', 'christmas', 'blocky']],
  prop_present_blue: ['props', ['present', 'gift', 'box', 'christmas', 'winter', 'holiday', 'blue', 'blocky']],
  prop_present_red: ['props', ['present', 'gift', 'box', 'christmas', 'winter', 'holiday', 'red', 'blocky']],
  prop_sled: ['props', ['sled', 'sleigh', 'toboggan', 'winter', 'snow', 'wood', 'blocky']],
  prop_snowman_classic: ['props', ['snowman', 'snow', 'winter', 'christmas', 'carrot', 'blocky']],
  prop_tree_small: ['nature', ['tree', 'christmas tree', 'fir', 'decorated', 'ornament', 'winter', 'holiday', 'blocky']],
  prop_wreath: ['props', ['wreath', 'christmas', 'door', 'holly', 'winter', 'holiday', 'decoration', 'blocky']],
  // PSX horror props
  px_vhs_tape: ['props', ['psx', 'ps1', 'retro', 'vhs', 'tape', 'video', 'horror', 'electronics', 'low-poly']],
  px_chair_wood: ['furniture', ['psx', 'ps1', 'retro', 'chair', 'wooden', 'horror', 'furniture', 'low-poly']],
  px_barrel: ['props', ['psx', 'ps1', 'retro', 'barrel', 'industrial', 'horror', 'low-poly']],
  px_crate_wood: ['props', ['psx', 'ps1', 'retro', 'crate', 'box', 'wooden', 'horror', 'low-poly']],
  px_note_paper: ['props', ['psx', 'ps1', 'retro', 'note', 'paper', 'letter', 'clue', 'horror', 'low-poly']],
  px_candle: ['props', ['psx', 'ps1', 'retro', 'candle', 'light', 'horror', 'low-poly']],
  px_fp_candle: ['props', ['psx', 'ps1', 'retro', 'candle', 'first person', 'held item', 'horror', 'low-poly']],
  px_fp_note: ['props', ['psx', 'ps1', 'retro', 'note', 'paper', 'first person', 'held item', 'horror', 'low-poly']],
  px_fp_battery: ['props', ['psx', 'ps1', 'retro', 'battery', 'first person', 'held item', 'flashlight', 'horror', 'low-poly']],
  px_fp_keycard: ['props', ['psx', 'ps1', 'retro', 'keycard', 'key card', 'first person', 'held item', 'horror', 'low-poly']],
  // Nov 2026 free drop (Store Simulator Kit 2.2)
  sk_produce_pile_apple: ['food', ['store', 'apple', 'apples', 'fruit', 'produce', 'crate', 'market', 'grocery', 'simulator']],
  sk_produce_pile_banana: ['food', ['store', 'banana', 'bananas', 'fruit', 'produce', 'crate', 'market', 'grocery', 'simulator']],
  sk_produce_pile_lettuce: ['food', ['store', 'lettuce', 'salad', 'vegetable', 'produce', 'crate', 'market', 'grocery', 'simulator']],
  sk_deli_cheese_wheel_cut: ['food', ['store', 'cheese', 'cheese wheel', 'deli', 'dairy', 'market', 'grocery', 'simulator']],
  sk_deli_cheese_wedge: ['food', ['store', 'cheese', 'wedge', 'deli', 'dairy', 'market', 'grocery', 'simulator']],
  sk_bakery_basket_baguette: ['food', ['store', 'baguette', 'bread', 'basket', 'wicker', 'bakery', 'market', 'simulator']],
  sk_bakery_basket_bread: ['food', ['store', 'bread', 'loaf', 'loaves', 'basket', 'wicker', 'bakery', 'market', 'simulator']],
  sk_sign_crate_price_clip: ['signage', ['store', 'price sign', 'chalk', 'chalkboard', 'price', 'market', 'deli', 'simulator']],
};

// Paid packs on itch (the free models are samples of these). url null = no live paid page.
export const PACKS = [
  { key: 'Store Simulator Kit', name: 'Store & Supermarket Simulator Kit', url: 'https://vuena.itch.io/store-simulator-kit', contents: '317 realistic PBR assets for supermarket and shop games (shelving, products, checkout and more).', formats: 'GLB, FBX (Unity, Unreal, Godot)' },
  { key: 'Gas Station Simulator Kit', name: 'Gas Station + Roadside Cafe Simulator Kit', url: 'https://vuena.itch.io/gas-station-simulator-kit', contents: '290 PBR assets for a gas station and roadside cafe game.', formats: 'GLB, FBX (Unity, Unreal, Godot)' },
  { key: 'Modular Apartment Interior Kit', name: 'Modular Apartment Interior Kit', url: 'https://vuena.itch.io/modular-apartment-interior-kit', contents: '200 PBR assets for modular apartment interiors.', formats: 'GLB, FBX (Unity, Unreal, Godot)' },
  { key: 'Factory Simulator Kit', name: 'Factory & Production Line Simulator Kit', url: 'https://vuena.itch.io/factory-simulator-kit', contents: '167 PBR assets for factory and production-line games.', formats: 'GLB, FBX (Unity, Unreal, Godot)' },
  { key: '48 Rigged Characters + 30 Animations', name: 'Rigged Blocky Characters', url: 'https://vuena.itch.io/blocky-characters-48', contents: '61 low-poly rigged characters on a shared skeleton, plus 30 animations.', formats: 'GLB, FBX (Unity, Unreal, Godot)' },
  { key: '50 Low-Poly Toy Cars', name: 'Low-Poly Toy Cars', url: 'https://vuena.itch.io/toy-cars-20', contents: '50 toy cars with separate wheels and 3 colourways.', formats: 'GLB, FBX (Unity, Godot)' },
  { key: 'Cute Pets & Wildlife', name: 'Cute Pets & Wildlife', url: 'https://vuena.itch.io/blocky-pets-wildlife', contents: '70 rigged low-poly animals sharing 13 animation clips.', formats: 'GLB, FBX (Unity, Unreal, Godot)' },
  { key: 'Blocky Winter & Christmas', name: 'Blocky Winter & Christmas', url: 'https://vuena.itch.io/blocky-winter-christmas', contents: '43 winter and Christmas props plus 3 rigged characters with 30 animations.', formats: 'GLB, FBX (Unity)' },
  { key: 'PSX Retro Horror Props Kit', name: 'PSX Retro Horror Props Kit', url: 'https://vuena.itch.io/psx-retro-horror-props-kit', contents: '158 low-poly PS1-style horror props.', formats: 'GLB, FBX (Godot)' },
  { key: 'PSX First-Person Arms & Items Kit', name: 'PSX First-Person Arms & Items Kit', url: 'https://vuena.itch.io/psx-first-person-arms-kit', contents: 'Rigged first-person arms with 21 animations and 30 held items.', formats: 'GLB, FBX (Godot)' },
  { key: 'Blocky Monsters', name: 'Blocky Monsters (Halloween)', url: 'https://vuena.itch.io/blocky-characters-48', contents: 'Rigged blocky monsters and Halloween props.', note: 'Monsters are a bonus in the Blocky Characters pack', formats: 'GLB, FBX' },
];
// Bundle: every pack plus future packs.
export const BUNDLE = { name: 'Vuena All-in-1', url: 'https://vuena.itch.io/complete-collection', contents: 'Every Vuena 3D asset pack plus future packs, in one purchase.' };
export const FREE_DOWNLOAD = 'https://vuena.itch.io/vuena-free-mega-starter';
