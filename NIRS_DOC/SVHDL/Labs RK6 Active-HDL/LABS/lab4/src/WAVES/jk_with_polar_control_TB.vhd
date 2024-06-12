-------------------------------------------------------------------------------
--
-- Title       : 
-- Design      : lab4
-- Author      : 666anton2005xr@gmail.com
-- Company     : 666anton2005xr@gmail.com
--
-------------------------------------------------------------------------------
--
-- File        : jk_with_polar_control_TB.vhd
-- Generated   : Sun May  5 19:22:55 2024
-- From        : C:\Users\666an\Documents\BMSTU\MVHDL\Labs (2)\lab4\src\WAVES\jk_with_polar_control_TB_settings.txt
-- By          : tb_generator.pl ver. ver 1.2s
--
-------------------------------------------------------------------------------
--
-- Description : main Test Bench entity
--
-------------------------------------------------------------------------------

library ieee;
use ieee.std_logic_1164.all;

use IEEE.waves_interface.all;
use WORK.UUT_test_pins.all;
use WORK.waves_objects.all;
use WORK.DESIGN_DECLARATIONS.all;
use WORK.MONITOR_UTILITIES.all;
use WORK.WAVES_GENERATOR.all;

-- User can put library and packages declaration here

entity jk_with_polar_control_wb is
end jk_with_polar_control_wb;

architecture TB_ARCHITECTURE of jk_with_polar_control_wb is

	-- Component declaration of the tested unit
	component jk_with_polar_control

	port (
		not_S : in STD_LOGIC;
		J : in STD_LOGIC;
		C : in STD_LOGIC;
		K : in STD_LOGIC;
		not_R : in STD_LOGIC;
		Q : out STD_LOGIC;
		not_Q : out STD_LOGIC);
	end component;

	-- Internal signals declarations:
	--   stimulus signals (STIM_)for the waveforms mapped into UUT inputs,
	--   observed signals (ACTUAL_) used in monitoring ACTUAL Values of UUT Outputs,
	--   bi-directional signals (BI_DIRECT_) mapped into UUT Inout ports,
	--    the BI_DIRECT_ signals are used as stimulus and also used for monitoring the UUT Inout ports
	signal STIM_not_S : STD_LOGIC;
	signal STIM_J : STD_LOGIC;
	signal STIM_C : STD_LOGIC;
	signal STIM_K : STD_LOGIC;
	signal STIM_not_R : STD_LOGIC;
	signal ACTUAL_Q : STD_LOGIC;
	signal ACTUAL_not_Q : STD_LOGIC;


	-- WAVES signals OUTPUTing each slice of the waves port list
	signal WPL  : WAVES_PORT_LIST;
	signal TAG  : WAVES_TAG;
	signal ERR_STATUS: STD_LOGIC:='L';
	-- Signal END_SIM denotes end of test vectors file
	signal END_SIM : BOOLEAN:=FALSE;

begin

	-- Process that generates the WAVES waveform
	WAVES: WAVEFORM (WPL, TAG);


	-- Processes that convert the WPL values to 1164 Logic Values



	-- Unit Under Test port map
	UUT: jk_with_polar_control
	port map(
		 not_S => STIM_not_S,
		 J => STIM_J,
		 C => STIM_C,
		 K => STIM_K,
		 not_R => STIM_not_R,
		 Q => ACTUAL_Q,
		 not_Q => ACTUAL_not_Q);


	-- Process denoting end of test vectors file
	NOTIFY_END_VECTORS: process (TAG)
	begin
		if TAG.len /= 0 then
			if ERR_STATUS='L' then
				report "All vectors passed.";
			elsif ERR_STATUS='1' then
				report "Errors were encountered on the output ports, differences are listed in jk_with_polar_control_report.log";
			end if;
			END_SIM <= TRUE;
			CLOSE_VECTOR;
			CLOSE_REPORT;
		end if;
	end process;

end TB_ARCHITECTURE;


configuration TESTBENCH_FOR_jk_with_polar_control of jk_with_polar_control_wb is
	for TB_ARCHITECTURE
		for UUT : jk_with_polar_control
			use entity work.jk_with_polar_control (jk_with_polar_control);
		end for;
	end for;
end TESTBENCH_FOR_jk_with_polar_control;
