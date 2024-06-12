library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity or_2 is
	port(
		x1 : in STD_LOGIC;
		x2 : in STD_LOGIC;
		y : out STD_LOGIC
	);
end or_2;									   

architecture or_2 of or_2 is
begin
	y <= x1 or x2 after 1ms;
end or_2;
