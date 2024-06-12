library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity or_3_no is
	port(
		x1 : in STD_LOGIC;
		x2 : in STD_LOGIC;
		x3 : in STD_LOGIC;
		y : out STD_LOGIC
	);
end or_3_no;

architecture or_3_no of or_3_no is
begin
	y <= not (x1 or x2 or x3) after 1ms;
end or_3_no;

library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity or_3_no2 is
	port(
		x1 : in STD_LOGIC;
		x2 : in STD_LOGIC;
		x3 : in STD_LOGIC;
		y : out STD_LOGIC
	);
end;