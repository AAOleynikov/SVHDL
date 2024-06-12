library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity or_2_no is
	port(
		x1 : in STD_LOGIC;
		x2 : in STD_LOGIC;
		y : out STD_LOGIC
	);
end or_2_no;

architecture or_2_no of or_2_no is
begin
	y <= not (x1 or x2) after 1ms;
end or_2_no;
