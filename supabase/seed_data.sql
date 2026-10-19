-- ==============================================================================
-- YouFix Seed Data for Initial Testing & Capstone Demonstrations
-- ==============================================================================

INSERT INTO public.diagnoses (
    image_url,
    category,
    cause,
    risk_level,
    recommended_action,
    is_diy,
    professional_required,
    safety_warning,
    instructions,
    created_at
) VALUES 
(
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    'Leaking pipe',
    'Loose slip-joint nut and degraded rubber washer beneath the P-trap.',
    'Low',
    'Tighten the slip nut and replace the rubber washer; apply PTFE thread seal tape.',
    true,
    false,
    'Place a bucket underneath before unscrewing. Avoid over-tightening plastic fittings to prevent cracking.',
    '[
        "Turn off the under-sink water supply valves.",
        "Position a bucket beneath the P-trap to capture trapped water.",
        "Hand-loosen the slip-joint nuts or use tongue-and-groove pliers gently.",
        "Inspect the washer for cracking or degradation and replace if needed.",
        "Wrap PTFE tape clockwise around the threads 3-4 times.",
        "Reassemble, hand-tighten firmly, and test for leaks with running water."
    ]'::jsonb,
    NOW() - INTERVAL '2 days'
),
(
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=800&q=80',
    'Damaged electrical socket',
    'Electrical arcing and thermal degradation causing severe socket discoloration and melted plastic faceplate.',
    'High',
    'Immediately cut circuit power at breaker and hire a licensed electrician to inspect branch wiring.',
    false,
    true,
    'DANGER: HIGH ELECTROCUTION & FIRE RISK. Do not touch the socket faceplate or plug anything in. Turn off the corresponding breaker immediately.',
    '[
        "Locate your main breaker panel immediately.",
        "Flip the circuit breaker controlling this receptacle to the OFF position.",
        "Verify power is completely cut using a non-contact voltage tester if safe.",
        "Do NOT attempt to disassemble or plug any appliance into this receptacle.",
        "Contact an authorized certified electrician to diagnose branch wiring integrity and replace the outlet box."
    ]'::jsonb,
    NOW() - INTERVAL '1 day'
),
(
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    'Clogged drain',
    'Hair and soap scum accumulation trapped inside bathroom sink drain pop-up stopper.',
    'Low',
    'Remove stopper, clear physical blockage with a drain snake or zip-it tool, and flush with hot water.',
    true,
    false,
    'Do not mix chemical drain cleaners with vinegar or bleach as hazardous toxic fumes can form.',
    '[
        "Clear standing water from the basin.",
        "Remove the pop-up stopper pivot rod underneath the sink if necessary.",
        "Insert a plastic barbed drain snake and twist slowly to catch debris.",
        "Pull out the hair and grime bundle and dispose of in trash.",
        "Pour boiling water mixed with mild dish soap down the drain to clear residual grease.",
        "Re-insert stopper and verify rapid drainage."
    ]'::jsonb,
    NOW() - INTERVAL '12 hours'
),
(
    'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
    'Flat tire',
    'Tread puncture caused by steel nail resulting in complete loss of pneumatic pressure.',
    'Medium',
    'Mount the spare tire or insert a vulcanized tire plug kit if puncture is within center tread.',
    true,
    false,
    'Never change a tire on a slope or in active traffic. Ensure hazard lights are on, vehicle is in park/reverse, and parking brake is firmly engaged.',
    '[
        "Park on firm, level ground and engage emergency parking brake.",
        "Loosen wheel lug nuts half a turn counter-clockwise with lug wrench before lifting.",
        "Position scissor or hydraulic jack at designated vehicle lift point.",
        "Raise vehicle until flat tire clears ground by 2-3 inches.",
        "Remove lug nuts, dismount flat tire, and mount spare wheel.",
        "Hand-tighten lug nuts in a star/cross pattern.",
        "Lower vehicle to ground and torque lug nuts fully to manufacturer spec."
    ]'::jsonb,
    NOW() - INTERVAL '5 hours'
),
(
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    'Overheating engine',
    'Radiator coolant leak or failed water pump causing critical coolant temperature spike.',
    'High',
    'Pull over safely, shut down engine, and arrange a tow to a certified mechanic.',
    false,
    true,
    'CRITICAL SAFETY WARNING: NEVER open the radiator cap or coolant reservoir while engine is hot! Scalding pressurized steam can cause severe burns.',
    '[
        "Safely pull off the roadway immediately and switch off engine.",
        "Turn on hazard warning lights and pop hood latch from inside vehicle.",
        "Wait at least 30-45 minutes for engine bay to cool before approaching.",
        "DO NOT attempt to open the radiator cap while hot.",
        "Check underneath for puddles of colored coolant fluid.",
        "Call roadside assistance or a certified automotive technician."
    ]'::jsonb,
    NOW() - INTERVAL '1 hour'
);
