import { Field, Input, Select } from "./ui";
import ProfileImageUpload from "./ProfileImageUpload";

const PLAYER_ROLES = [
  { value: "playing_11", label: "Playing XI" },
  { value: "substitute", label: "Substitute" },
  { value: "coach", label: "Coach" },
  { value: "support_staff", label: "Support Staff" },
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const HANDS = ["Right", "Left"];

// The API stores batting_position and bowling_type as free-form strings in the
// OpenAPI schema, but the backend actually validates both against a strict
// enum and rejects anything else with:
//
//   batting_position: Value error, batting_position must be Opening,
//                     Middle Order, Tail Ender, or Wicket Keeper
//   bowling_type: Value error, bowling_type must be Fast, Medium Fast, or Spin
//
// These strings are therefore sent verbatim and must match the backend
// exactly, including the single spaces in "Middle Order", "Tail Ender",
// "Wicket Keeper" and "Medium Fast". The schema does not publish this enum, so
// treat these lists as the contract and re-check them if the backend changes.
const BATTING_POSITIONS = [
  "Opening",
  "Middle Order",
  "Tail Ender",
  "Wicket Keeper",
];

const BOWLING_TYPES = ["Fast", "Medium Fast", "Spin"];

// These fields used to be free-text inputs and the API still types them as
// plain strings, so records created before the enum was enforced can hold a
// value that is no longer accepted. Appending the stored value keeps such a
// record visible when edited instead of showing the field as blank and implying
// it had no value. Such a record cannot be saved until one of the valid options
// above is chosen, which is the intended outcome rather than a silent rewrite.
function withStoredValue(options, current) {
  const value = typeof current === "string" ? current.trim() : "";
  if (!value || options.includes(value)) return options;
  return [...options, value];
}

function PlayerFormFields({
  form,
  onChange,
  countries,
  countryCodes,
  levels,
  teams,
  teamRequired = false,
  showEmptyWarnings = false,
}) {
  const selectedCountry = countries?.find(
    (country) => country.id === Number(form.country_id),
  );
  const selectedState = selectedCountry?.states?.find(
    (state) => state.id === Number(form.state_id),
  );

  return (
    <div className="space-y-5">
      {/* Names */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First Name" required>
          <Input
            name="first_name"
            autoComplete="off"
            placeholder="e.g. Virat"
            value={form.first_name}
            onChange={(event) => onChange("first_name", event.target.value)}
          />
        </Field>

        <Field label="Last Name" required>
          <Input
            name="last_name"
            autoComplete="off"
            placeholder="e.g. Kohli"
            value={form.last_name}
            onChange={(event) => onChange("last_name", event.target.value)}
          />
        </Field>
      </div>

      {/* Date of birth & gender */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date of Birth" required>
          <Input
            name="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={(event) => onChange("date_of_birth", event.target.value)}
          />
        </Field>

        <Field label="Gender" required>
          <Select
            name="gender"
            value={form.gender}
            onChange={(event) => onChange("gender", event.target.value)}
          >
            <option value="">Select gender</option>
            {GENDERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Optional profile image */}
      <ProfileImageUpload
        value={form.profile_image}
        onChange={(value) => onChange("profile_image", value)}
      />

      {/* Batting attributes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Batting Hand" required>
          <Select
            name="batting_hand"
            value={form.batting_hand}
            onChange={(event) => onChange("batting_hand", event.target.value)}
          >
            <option value="">Select</option>
            {HANDS.map((hand) => (
              <option key={hand} value={hand}>
                {hand}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Batting Position" required>
          <Select
            name="batting_position"
            value={form.batting_position}
            onChange={(event) =>
              onChange("batting_position", event.target.value)
            }
          >
            <option value="">Select position</option>
            {withStoredValue(BATTING_POSITIONS, form.batting_position).map(
              (position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ),
            )}
          </Select>
        </Field>
      </div>

      {/* Bowling attributes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bowling Hand" required>
          <Select
            name="bowling_hand"
            value={form.bowling_hand}
            onChange={(event) => onChange("bowling_hand", event.target.value)}
          >
            <option value="">Select</option>
            {HANDS.map((hand) => (
              <option key={hand} value={hand}>
                {hand}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Bowling Action / Type" required>
          <Select
            name="bowling_type"
            value={form.bowling_type}
            onChange={(event) => onChange("bowling_type", event.target.value)}
          >
            <option value="">Select bowling type</option>
            {withStoredValue(BOWLING_TYPES, form.bowling_type).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Physical attributes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Height (cm)" required>
          <Input
            name="height"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 175"
            value={form.height}
            onChange={(event) => onChange("height", event.target.value)}
          />
        </Field>

        <Field label="Weight (kg)" required>
          <Input
            name="weight"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 70"
            value={form.weight}
            onChange={(event) => onChange("weight", event.target.value)}
          />
        </Field>
      </div>

      {/* Location attributes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Country" required>
          <Select
            name="country_id"
            value={form.country_id}
            onChange={(event) => onChange("country_id", event.target.value)}
          >
            <option value="">Select country</option>
            {countries?.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="State" required>
          <Select
            name="state_id"
            disabled={!selectedCountry}
            value={form.state_id}
            onChange={(event) => onChange("state_id", event.target.value)}
          >
            <option value="">Select state</option>
            {selectedCountry?.states?.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="City" required>
          <Select
            name="city_id"
            disabled={!selectedState}
            value={form.city_id}
            onChange={(event) => onChange("city_id", event.target.value)}
          >
            <option value="">Select city</option>
            {selectedState?.cities?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Team assignment */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-5 w-1.5 rounded bg-brand-500" aria-hidden="true" />
          <h2 className="text-[11px] font-bold uppercase text-ink-subtle">
            Team Assignment
          </h2>
          {!teamRequired && (
            <span className="text-[10px] font-normal normal-case text-ink-faint">
              (optional — can be assigned later)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Team" required={teamRequired}>
            <Select
              name="team_id"
              value={form.team_id}
              onChange={(event) => onChange("team_id", event.target.value)}
            >
              <option value="">Select team</option>
              {teams?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
            {showEmptyWarnings && (!teams || teams.length === 0) && (
              <p className="text-[11px] text-warning">
                No teams exist yet. Please register a team first.
              </p>
            )}
          </Field>

          <Field label="Level" required={teamRequired}>
            <Select
              name="level_id"
              value={form.level_id}
              onChange={(event) => onChange("level_id", event.target.value)}
            >
              <option value="">Select level</option>
              {levels?.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </Select>
            {showEmptyWarnings && (!levels || levels.length === 0) && (
              <p className="text-[11px] text-warning">
                No levels exist yet. Please configure team levels first.
              </p>
            )}
          </Field>

          <Field label="Role">
            <Select
              name="role"
              value={form.role}
              onChange={(event) => onChange("role", event.target.value)}
            >
              {PLAYER_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {/* Contact details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Code" required>
          <Select
            name="country_code"
            value={form.country_code}
            onChange={(event) => onChange("country_code", event.target.value)}
          >
            <option value="">--</option>
            {countryCodes?.map((countryCode) => (
              <option key={countryCode.code} value={countryCode.code}>
                {countryCode.code}
              </option>
            ))}
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Mobile Number" required>
            <Input
              name="mobile_number"
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 9876543210"
              value={form.mobile_number}
              onChange={(event) =>
                onChange("mobile_number", event.target.value)
              }
            />
          </Field>
        </div>
      </div>

      <Field label="Email Address" required>
        <Input
          name="email"
          type="email"
          autoComplete="off"
          placeholder="e.g. player@leaguedomain.com"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
        />
      </Field>
    </div>
  );
}

export { PlayerFormFields };
export default PlayerFormFields;