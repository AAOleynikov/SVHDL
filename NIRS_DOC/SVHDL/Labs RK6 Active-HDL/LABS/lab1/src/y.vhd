library IEEE;
use IEEE.STD_LOGIC_1164.all;

entity y is
	 port(
		 x1 : in STD_LOGIC;
		 x2 : in STD_LOGIC;
		 x3 : in STD_LOGIC;
		 x4 : in STD_LOGIC;
		 y1 : out STD_LOGIC;
		 y2 : out STD_LOGIC;
		 y3 : out STD_LOGIC 
	     );
end y;										  

architecture y of y is
begin

	y1 <= ((x2 and x4) or (x1 and (not x2))) or (x3 and (not x4));
	y2 <= ((((not x2) and (not x3)) or ((((not x1) and x2) and x3) and x4)) or (x1 and (not x2))) or ((x1 and x3) and (not x4));
	y3 <= ((((not x1) and (not x3)) and x4) or ((x1 and (not x2)) and x4)) or (((not x2) and x3) and (not x4));

end y;
