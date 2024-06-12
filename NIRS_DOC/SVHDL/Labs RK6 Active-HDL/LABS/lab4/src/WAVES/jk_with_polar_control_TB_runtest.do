setactivelib -work
#Compiling UUT entity design files
comp "$dsn\src\no.vhd"
comp "$dsn\src\or_3_no.vhd"
comp "$dsn\src\or_2_no.vhd"
comp "$dsn\src\and_3_no.vhd"
comp "$dsn\src\jk_with_polar_control.vhd"

#Compiling WAVES Testbench neccessary files
acom -work lab4 "$dsn\src\WAVES\jk_with_polar_control_TB_pins.vhd"
acom -work lab4 "$ALDEC\DAT\WAVES\waves_objects.vhd"
acom -work lab4 "$dsn\src\WAVES\jk_with_polar_control_TB_declaration.vhd"
acom -work lab4 "$ALDEC\DAT\WAVES\monitor_utilities.vhd"
acom -work lab4 "$ALDEC\DAT\WAVES\waves_generator.vhd"
acom -work lab4 "$dsn\src\WAVES\jk_with_polar_control_TB.vhd"

#Compiling timing configuration
#acom -work lab4 "$dsn\src\WAVES\"

#Run simulation
asim +access +r  TESTBENCH_FOR_jk_with_polar_control

wave
wave -noreg STIM_not_S
wave -noreg STIM_J
wave -noreg STIM_C
wave -noreg STIM_K
wave -noreg STIM_not_R
wave -noreg ACTUAL_Q
wave -noreg ACTUAL_not_Q
wave WPL
wave ERR_STATUS

run

#End simulation macro
